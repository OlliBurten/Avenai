# --- Environment version gate (run before any other imports) ---
import sys
try:
    import pkg_resources
except Exception:
    pkg_resources = None

REQUIRED_VERSIONS = {
    "llama-index": "0.10.55",
    "openai": "1.1.0",
    "streamlit": "1.32.0",
}

def _version_mismatches():
    if pkg_resources is None:
        return []
    mismatches = []
    for pkg, req in REQUIRED_VERSIONS.items():
        try:
            installed = pkg_resources.get_distribution(pkg).version
        except Exception:
            mismatches.append((pkg, "not installed", req))
            continue
        from pkg_resources import parse_version
        if parse_version(installed) < parse_version(req):
            mismatches.append((pkg, installed, req))
    return mismatches

_mm = _version_mismatches()
if _mm:
    lines = ["Your Python packages are out of date for this project:"]
    for pkg, installed, req in _mm:
        lines.append(f"- {pkg}: installed {installed}, required ≥ {req}")
    lines.append("\nFix now with one of:")
    lines.append("  python3 -m pip install -r requirements.txt")
    lines.append("  python3 -m pip install \"llama-index>=0.10.55\" \"openai>=1.1.0\" \"streamlit>=1.32.0\"")
    msg = "\n".join(lines)
    # Try Streamlit error UI if available; otherwise print to stderr
    try:
        import streamlit as st
        st.error(msg)
    except Exception:
        print(msg, file=sys.stderr)
    sys.exit(1)
# --- End version gate ---
import os
import nltk

from supabase import create_client, Client, SupabaseException, AuthApiError
import streamlit_authenticator as stauth

from dotenv import load_dotenv, find_dotenv, dotenv_values
load_dotenv(override=True)

DEV_HINTS = os.getenv("DEV_HINTS", "0") == "1"
# --- Evaluation harness toggle ---
EVAL_MODE = os.getenv("EVAL_MODE", "0") == "1"
HYDE_AVAILABLE = False
HYDE_PATH_USED = None
try:
    from llama_index.core.query_pipeline import HyDEQueryTransform  # newest path in some 0.13.x builds
    HYDE_AVAILABLE = True
    HYDE_PATH_USED = "llama_index.core.query_pipeline"
except Exception:
    try:
        from llama_index.core.query_transformations import HyDEQueryTransform  # common new path
        HYDE_AVAILABLE = True
        HYDE_PATH_USED = "llama_index.core.query_transformations"
    except Exception:
        try:
            from llama_index.indices.query.query_transform.base import HyDEQueryTransform  # legacy path
            HYDE_AVAILABLE = True
            HYDE_PATH_USED = "llama_index.indices.query.query_transform.base"
        except Exception:
            HyDEQueryTransform = None  # type: ignore
print("DEBUG: HYDE available:", HYDE_AVAILABLE, "path:", HYDE_PATH_USED, file=sys.stderr)

# --- Debug: verify env variables loaded ---
import sys
print("DEBUG: Loaded OPENAI_API_KEY starts with:", os.getenv("OPENAI_API_KEY")[:10], file=sys.stderr)
print("DEBUG: Loaded OPENAI_PROJECT:", os.getenv("OPENAI_PROJECT"), file=sys.stderr)
# --- Additional diagnostics for dotenv ---
env_path = find_dotenv()
print("DEBUG: Using .env file:", env_path, file=sys.stderr)
env_file_vals = dotenv_values(env_path) if env_path else {}
print("DEBUG: .env OPENAI_API_KEY prefix:", (env_file_vals.get("OPENAI_API_KEY", "")[:10]), file=sys.stderr)
print("DEBUG: .env contains 'alias':", "alias" in (env_file_vals.get("OPENAI_API_KEY", "")), file=sys.stderr)

# --- OpenAI API key sanity check & LlamaIndex defaults ---
# Sanitize API key aggressively (remove accidental newlines/spaces/quotes/zero-width)
def _sanitize_api_key(raw: str) -> str:
    if raw is None:
        return ""
    # Remove surrounding quotes and whitespace
    key = raw.strip().strip('"').strip("'")
    # Remove zero-width and non-printable characters
    key = "".join(ch for ch in key if ch.isprintable())
    # Remove any whitespace characters inside the key
    key = "".join(key.split())
    # Common copy artifacts: sometimes "alias" or ellipsis gets appended
    for artifact in ("…alias", "...alias", "alias", "…"):
        if key.endswith(artifact):
            key = key[: -len(artifact)]
    return key

raw_key = os.getenv("OPENAI_API_KEY")
OPENAI_API_KEY = _sanitize_api_key(raw_key)

# --- Check for 'alias' substring in keys and fail fast if present ---
if "alias" in (raw_key or "") or "alias" in OPENAI_API_KEY:
    import sys
    import streamlit as st
    print("DEBUG: Found 'alias' in API key; this will cause authentication to fail.", file=sys.stderr)
    st.error("Your OPENAI_API_KEY contains the word 'alias', which means you copied the wrong thing from the dashboard. "
             "Go to the OpenAI API keys page, click the copy button for the full key, and paste it into your .env without extra text.")
    st.stop()
from openai import OpenAI
OPENAI_PROJECT = os.getenv("OPENAI_PROJECT", "").strip()
OPENAI_ORG = os.getenv("OPENAI_ORG", "").strip()

# Extra diagnostics
print("DEBUG: Raw key present:", raw_key is not None, file=sys.stderr)
print("DEBUG: Sanitized key prefix/suffix:", OPENAI_API_KEY[:10], OPENAI_API_KEY[-10:], file=sys.stderr)
print("DEBUG: Contains 'alias' substring:", "alias" in (raw_key or ""), file=sys.stderr)

import re
key_ok = bool(re.match(r"^sk-proj-[A-Za-z0-9_-]{20,}$", OPENAI_API_KEY)) or bool(re.match(r"^sk-[A-Za-z0-9_-]{20,}$", OPENAI_API_KEY))
if not key_ok:
    import streamlit as st
    st.error(
        "Your OPENAI_API_KEY looks malformed after sanitization. Double-check you copied the **entire** key from the OpenAI dashboard.\n\n"
        "Tips:\n"
        "• Copy the key again using the copy button (not manual selection).\n"
        "• Ensure it’s a single line with no spaces or line breaks.\n"
        "• Do **not** paste any trailing words like ‘alias’.\n"
    )
    st.stop()

# Only pass organization if it looks valid; avoid placeholder causing 401s
org_arg = OPENAI_ORG if OPENAI_ORG.startswith("org_") and len(OPENAI_ORG) > 4 else None

client = OpenAI(api_key=OPENAI_API_KEY, project=OPENAI_PROJECT or None, organization=org_arg)

# Lightweight live check for OpenAI API key validity
try:
    # Minimal no-op request to validate auth quickly
    models = client.models.list()
    print("DEBUG: Available models:", models.data[0].id if getattr(models, "data", None) else "None", file=sys.stderr)
except Exception as e:
    import streamlit as st
    st.error(f"OpenAI auth check failed before index build: {e}")
    st.stop()

# Guard: if using a project key, require a project id
if OPENAI_API_KEY.startswith("sk-proj-") and not OPENAI_PROJECT:
    import streamlit as st
    st.error(
        "You are using a project-scoped key (sk-proj-…), but OPENAI_PROJECT is not set. "
        "Go to the OpenAI dashboard → copy your Project ID (starts with 'proj_') and set OPENAI_PROJECT in your .env, then restart."
    )
    st.stop()

# --- Additional debug prints for key sanitization and client mode ---
print("DEBUG: Key length:", len(OPENAI_API_KEY), file=sys.stderr)
print("DEBUG: Using project-scoped auth with client; org set:", bool(org_arg), file=sys.stderr)

# Configure LlamaIndex to use OpenAI models
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.llms.openai import OpenAI as LIOpenAI
from llama_index.core import Settings
# Add import for SentenceSplitter to customize node parsing
from llama_index.core.node_parser import SentenceSplitter
Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-large", client=client)
Settings.llm = LIOpenAI(model="gpt-4o-mini", client=client)
# Use default splitting to avoid NLTK dependency issues
Settings.node_parser = SentenceSplitter(
    chunk_size=1200,
    chunk_overlap=200,
    paragraph_separator="\n\n"
)

# Force NLTK to download into a writable directory
nltk_data_dir = os.path.join(os.getcwd(), "nltk_data")
os.makedirs(nltk_data_dir, exist_ok=True)
nltk.data.path.append(nltk_data_dir)

# Patch downloader to avoid permission errors
original_download = nltk.download
def safe_download(package, download_dir=None, **kwargs):
    return original_download(package, download_dir=nltk_data_dir, **kwargs)
nltk.download = safe_download

import nltk
import os
import streamlit as st

from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.core import Settings
from PyPDF2 import PdfReader
from llama_index.core import Document, VectorStoreIndex
from llama_index.core import StorageContext, load_index_from_storage
# --- Hybrid retrieval imports ---
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.core.retrievers import QueryFusionRetriever

# BM25 import with fallback; may live in different modules depending on version
BM25_AVAILABLE = True
try:
    from llama_index.core.retrievers import BM25Retriever  # newer path
except Exception:
    try:
        from llama_index.retrievers.bm25 import BM25Retriever  # older extra package path
    except Exception as e:
        BM25_AVAILABLE = False
        BM25Retriever = None  # type: ignore
        if DEV_HINTS:
            try:
                import streamlit as st
                st.info(f"BM25 unavailable in this environment (falling back to vector-only): {e}")
            except Exception:
                pass
from io import StringIO
from datetime import datetime

st.set_page_config(page_title="Onbo - AI-Powered API Assistant")

# Auth Setup
from streamlit_extras.add_vertical_space import add_vertical_space
from streamlit_authenticator import Authenticate

# Initialize Supabase client if env vars exist
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

# Dummy user data — replace with dynamic Supabase later
names = ["Demo User"]
usernames = ["demo"]
passwords = ["demo123"]

# Hash each password individually to support different library versions
hashed_passwords = [stauth.Hasher().hash(pw) for pw in passwords]

# Build credentials dict expected by newer streamlit-authenticator versions
credentials = {
    "usernames": {
        usernames[0]: {
            "name": names[0],
            "password": hashed_passwords[0],
        }
    }
}

authenticator = Authenticate(
    credentials,
    cookie_name="avenai",
    key="auth",
    cookie_expiry_days=1,
)

authenticator.login(location="main")
name = st.session_state.get("name")
authentication_status = st.session_state.get("authentication_status")
username = st.session_state.get("username")

if authentication_status is False:
    st.error("Username/password is incorrect")
elif authentication_status is None:
    st.warning("Please enter your username and password")
else:
    authenticator.logout(location="sidebar")

if authentication_status:
    st.title("Onbo: AI-Powered API Assistant")

    # Input for session and version
    session_id = st.text_input("Enter a session ID (e.g., client name):", value="default")
    version = st.text_input("Enter a version for this session (e.g., v1, prod):", value="v1")
    version_dir = os.path.join("sessions", session_id, version)
    os.makedirs(version_dir, exist_ok=True)
    import json
    tags_path = os.path.join(version_dir, "tags.json")
    try:
        with open(tags_path, "r", encoding="utf-8") as f:
            saved_tags_map: dict[str, list[str]] = json.load(f)
    except Exception:
        saved_tags_map = {}

    # --- QA cache TTL + pruning ---
    try:
        QA_CACHE_TTL_SECONDS = int(os.getenv("QA_CACHE_TTL_SECONDS", "86400"))  # 24h default
    except Exception:
        QA_CACHE_TTL_SECONDS = 86400

    def qa_cache_prune(now_ts: float | None = None) -> tuple[int, int]:
        """Prune stale QA cache rows. Returns (deleted_old_sig, deleted_stale_ttl)."""
        import time as _time
        _now = now_ts or _time.time()
        deleted_old = 0
        deleted_ttl = 0
        with sqlite3.connect(cache_db_path) as _conn:
            _conn.execute(
                """
                CREATE TABLE IF NOT EXISTS qa_cache (
                    cache_key TEXT PRIMARY KEY,
                    query TEXT,
                    tags TEXT,
                    strict INTEGER,
                    answer TEXT,
                    created_at REAL,
                    index_sig TEXT
                )
                """
            )
            # Delete entries from previous index signatures
            cur1 = _conn.execute("DELETE FROM qa_cache WHERE index_sig IS NOT NULL AND index_sig != ?", (current_index_sig,))
            deleted_old = cur1.rowcount if hasattr(cur1, 'rowcount') else 0
            # Delete entries older than TTL
            cur2 = _conn.execute("DELETE FROM qa_cache WHERE created_at IS NOT NULL AND (? - created_at) > ?", (_now, QA_CACHE_TTL_SECONDS))
            deleted_ttl = cur2.rowcount if hasattr(cur2, 'rowcount') else 0
            _conn.commit()
        return deleted_old, deleted_ttl

    # Run prune on startup
    try:
        _d_old, _d_ttl = qa_cache_prune()
        if DEV_HINTS and (_d_old or _d_ttl):
            print(f"DEBUG: QA cache pruned — old_sig={_d_old}, ttl={_d_ttl}", file=sys.stderr)
    except Exception as _e:
        if DEV_HINTS:
            print(f"DEBUG: QA cache prune failed: {_e}", file=sys.stderr)

    # --- Step 1: Lightweight SQLite cache for document metadata ---
    import sqlite3

    cache_db_path = os.path.join(version_dir, "doc_cache.sqlite")

    def init_cache():
        conn = sqlite3.connect(cache_db_path)
        c = conn.cursor()
        c.execute("""
            CREATE TABLE IF NOT EXISTS doc_meta_cache (
                filename TEXT PRIMARY KEY,
                last_modified REAL,
                page_count INTEGER,
                tag_list TEXT
            )
        """)
        conn.commit()
        conn.close()

    def update_cache(filename, last_modified, page_count, tag_list):
        conn = sqlite3.connect(cache_db_path)
        c = conn.cursor()
        c.execute("""
            INSERT OR REPLACE INTO doc_meta_cache (filename, last_modified, page_count, tag_list)
            VALUES (?, ?, ?, ?)
        """, (filename, last_modified, page_count, ",".join(tag_list)))
        conn.commit()
        conn.close()

    def read_cache(filename):
        conn = sqlite3.connect(cache_db_path)
        c = conn.cursor()
        c.execute("SELECT last_modified, page_count, tag_list FROM doc_meta_cache WHERE filename = ?", (filename,))
        row = c.fetchone()
        conn.close()
        if not row:
            return None
        return {
            "last_modified": row[0],
            "page_count": row[1],
            "tag_list": row[2].split(",") if row[2] else []
        }

    init_cache()

    # --- Step 2: prepare index signature (no behavior change yet) ---
    def _compute_index_sig(base_dir: str) -> str:
        """Return a simple signature representing current doc/tag state by using
        the latest modified time across non-hidden files under version_dir
        (excluding the vector index folder)."""
        latest = 0.0
        for root, dirs, files in os.walk(base_dir):
            if os.path.basename(root) == "index":
                continue
            for fn in files:
                if fn.startswith("."):
                    continue
                fpath = os.path.join(root, fn)
                try:
                    latest = max(latest, os.path.getmtime(fpath))
                except Exception:
                    pass
        return str(int(latest))

    current_index_sig = _compute_index_sig(version_dir)
    # --- Answer cache helpers (per query + tags + strict) ---
def _qa_cache_key(q, tags, strict):
    import hashlib, json as _json
    payload = _json.dumps({"q": q, "tags": sorted(tags or []), "strict": bool(strict)}, sort_keys=True)
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()

def qa_cache_get(q, tags, strict):
    import time as _time
    with sqlite3.connect(cache_db_path) as _conn:
        _conn.execute(
            """
            CREATE TABLE IF NOT EXISTS qa_cache (
                cache_key TEXT PRIMARY KEY,
                query TEXT,
                tags TEXT,
                strict INTEGER,
                answer TEXT,
                created_at REAL,
                index_sig TEXT
            )
            """
        )
        row = _conn.execute(
            "SELECT answer,index_sig,created_at FROM qa_cache WHERE cache_key=?",
            (_qa_cache_key(q, tags, strict),),
        ).fetchone()
    if not row:
        return None
    ans, sig, created = row[0], row[1], float(row[2] or 0)
    if sig != current_index_sig:
        return None
    if QA_CACHE_TTL_SECONDS and created and (_time.time() - created) > QA_CACHE_TTL_SECONDS:
        return None
    return ans

def qa_cache_set(q, tags, strict, answer):
    import time as _time
    with sqlite3.connect(cache_db_path) as _conn:
        _conn.execute(
            "INSERT OR REPLACE INTO qa_cache (cache_key,query,tags,strict,answer,created_at,index_sig) VALUES (?,?,?,?,?,?,?)",
            (
                _qa_cache_key(q, tags, strict),
                q,
                ",".join(tags or []),
                int(bool(strict)),
                str(answer or ""),
                _time.time(),
                current_index_sig,
            ),
        )
        _conn.commit()

#
# --- Helper to tag docs by source ---
def infer_doc_tags(filename: str) -> list[str]:
    name = (filename or "").lower()
    tags: list[str] = []
    if any(k in name for k in ["zignsec", "mobile sdk", "id & bio", "bio verification"]):
        tags.append("zignsec")
    if "bankid" in name:
        tags.append("bankid")
    if "mdmx" in name:
        tags.append("mdmx")
    if any(k in name for k in ["monitoring", "pmm", "pmmtld"]):
        tags.append("monitoring")
    if not tags:
        tags.append("general")
    return tags

def infer_doc_tag(filename: str) -> str:
    # Back-compat shim: first tag from infer_doc_tags
    return infer_doc_tags(filename)[0]

# Load existing documents
import re as _re
_docs: list[Document] = []
for _filename in os.listdir(version_dir):
    if _filename == "query_log.txt":
        continue  # Exclude query_log.txt from indexing
    _file_path = os.path.join(version_dir, _filename)
    _file_type = _filename.split(".")[-1]

    if _file_type == "txt":
        with open(_file_path, "r", encoding="utf-8") as _f:
            _content = _f.read()
        _tags = saved_tags_map.get(_filename, infer_doc_tags(_filename))
        _metadata_common = {"filename": _filename, "source_type": "txt", "doc_tags": _tags, "doc_tag": _tags[0]}
        _doc = Document(text=_content, metadata=_metadata_common)
        _docs.append(_doc)
    elif _file_type == "pdf":
        _reader = PdfReader(_file_path)
        # Create one Document per page so we can cite page numbers later
        for _i, _page in enumerate(_reader.pages, start=1):
            _text = _page.extract_text()
            if not _text:
                continue
            # Skip short pages or those containing 'Table of contents' or 'Introduction' (case-insensitive)
            if len(_text.strip()) < 200 or _re.search(r"(Table of contents|Introduction)", _text, _re.IGNORECASE):
                continue
            _tags = saved_tags_map.get(_filename, infer_doc_tags(_filename))
            _metadata_common = {"filename": _filename, "page": _i, "source_type": "pdf", "doc_tags": _tags, "doc_tag": _tags[0]}
            _doc = Document(text=_text, metadata=_metadata_common)
            _docs.append(_doc)
        continue
    else:
        continue

# Upload new files
_uploaded_files = st.file_uploader("Upload API docs (.txt or .pdf)", type=["txt", "pdf"], accept_multiple_files=True)
if _uploaded_files:
    for _uploaded in _uploaded_files:
        if _uploaded.name == "query_log.txt":
            continue
        _dst = os.path.join(version_dir, _uploaded.name)
        if not os.path.exists(_dst):
            with open(_dst, "wb") as _f:
                _f.write(_uploaded.getbuffer())
            _ft = _uploaded.name.split(".")[-1]
            if _ft == "txt":
                _content = StringIO(_uploaded.getvalue().decode("utf-8")).read()
                _tags = saved_tags_map.get(_uploaded.name, infer_doc_tags(_uploaded.name))
                _metadata_common = {"filename": _uploaded.name, "source_type": "txt", "doc_tags": _tags, "doc_tag": _tags[0]}
                _doc = Document(text=_content, metadata=_metadata_common)
                _docs.append(_doc)
            elif _ft == "pdf":
                _reader = PdfReader(_uploaded)
                for _i, _page in enumerate(_reader.pages, start=1):
                    _text = _page.extract_text()
                    if not _text:
                        continue
                    if len(_text.strip()) < 200 or _re.search(r"(Table of contents|Introduction)", _text, _re.IGNORECASE):
                        continue
                    _tags = saved_tags_map.get(_uploaded.name, infer_doc_tags(_uploaded.name))
                    _metadata_common = {"filename": _uploaded.name, "page": _i, "source_type": "pdf", "doc_tags": _tags, "doc_tag": _tags[0]}
                    _doc = Document(text=_text, metadata=_metadata_common)
                    _docs.append(_doc)
                continue
            else:
                continue

# Show files
if _docs:
    st.markdown(f"### Documents for session `{session_id}` version `{version}`:")
    _counts = {}
    for _d in _docs:
        _fname = _d.metadata.get("filename", "Unknown")
        _counts[_fname] = _counts.get(_fname, 0) + 1
    for _fname, _cnt in sorted(_counts.items()):
        _tags = saved_tags_map.get(_fname, infer_doc_tags(_fname))
        _label = f"- {_fname}  —  tags: {', '.join(sorted(set(_tags)))}" + (f" ({_cnt} pages)" if _cnt > 1 else "")
        st.markdown(_label)

    # --- Main panel tag overview (chips + counts)
    _tag_counts_main = {}
    for _d in _docs:
        _meta = _d.metadata or {}
        _tags_here = _meta.get("doc_tags") or [_meta.get("doc_tag", "general")]
        for _t in _tags_here:
            _tag_counts_main[_t] = _tag_counts_main.get(_t, 0) + 1
    if _tag_counts_main:
        st.markdown("#### Tag overview")
        _chips_html = " ".join(
            f"<span style='display:inline-block;padding:2px 8px;margin:2px;border:1px solid #888;border-radius:12px;font-size:0.85em;'>"
            f"{_t} ({_cnt})</span>" for _t, _cnt in sorted(_tag_counts_main.items())
        )
        st.markdown(_chips_html, unsafe_allow_html=True)

    # --- Manage Tags UI ---
    with st.sidebar.expander("Manage tags", expanded=st.session_state.get("open_manage_tags", False)):
        st.caption("Assign one or more tags to each document. These are saved per session/version.")
        from collections import defaultdict as _dd
        _tag_counts: dict[str, int] = _dd(int)
        _tag_files: dict[str, list[str]] = _dd(list)
        for _d in _docs:
            _meta = _d.metadata or {}
            _tags_here = _meta.get("doc_tags") or [_meta.get("doc_tag", "general")]
            _fname = _meta.get("filename", "Unknown")
            for _t in set(_tags_here):
                _tag_counts[_t] += 1
                if _fname not in _tag_files[_t]:
                    _tag_files[_t].append(_fname)
        if _tag_counts:
            st.markdown("**Tag overview** (nodes per tag / example files):")
            for _t in sorted(_tag_counts.keys()):
                _preview = ", ".join(sorted(_tag_files[_t])[:3])
                _more = "…" if len(_tag_files[_t]) > 3 else ""
                st.markdown(f"- `{_t}` — **{_tag_counts[_t]}** nodes  ·  _{_preview}{_more}_")
        st.divider()
        st.markdown("**Bulk tag actions** — apply/remove a tag across multiple documents:")
        _filenames_all = sorted({_d.metadata.get("filename", "Unknown") for _d in _docs})
        _sel_docs = st.multiselect("Select documents", options=_filenames_all, key="bulk_docs")
        _bulk_tag = st.text_input("Tag to apply/remove (existing or new)", key="bulk_tag_input").strip().lower()
        _colA, _colB = st.columns(2)
        def __save_and_rerun():
            with open(tags_path, "w", encoding="utf-8") as _f:
                json.dump(saved_tags_map, _f, ensure_ascii=False, indent=2)
            st.success("Tags saved. Rebuilding index…")
            try:
                st.rerun()
            except Exception:
                try:
                    st.experimental_rerun()
                except Exception:
                    pass
        with _colA:
            if st.button("Apply tag to selected docs", disabled=not (_sel_docs and _bulk_tag)):
                for _fname in _sel_docs:
                    _cur = saved_tags_map.get(_fname, infer_doc_tags(_fname))
                    if _bulk_tag not in _cur:
                        _cur = sorted(set(_cur + [_bulk_tag]))
                    saved_tags_map[_fname] = _cur
                __save_and_rerun()
        with _colB:
            if st.button("Remove tag from selected docs", disabled=not (_sel_docs and _bulk_tag)):
                for _fname in _sel_docs:
                    _cur = saved_tags_map.get(_fname, infer_doc_tags(_fname))
                    _cur = [__t for __t in _cur if __t != _bulk_tag]
                    if not _cur:
                        _cur = ["general"]
                    saved_tags_map[_fname] = _cur
                __save_and_rerun()
        st.divider()
        _filenames = sorted({_d.metadata.get("filename", "Unknown") for _d in _docs})
        _new_tag_name = st.text_input("Create a new tag (optional)", key="new_tag_name")
        _created_tag = None
        _tag_set = set()
        for _d in _docs:
            for __t in _d.metadata.get("doc_tags", []) or [_d.metadata.get("doc_tag", "general")]:
                _tag_set.add(__t)
        _available_tags = sorted(_tag_set)
        if _new_tag_name and _new_tag_name.strip():
            _created_tag = _new_tag_name.strip().lower()
            if _created_tag not in _available_tags:
                _available_tags.append(_created_tag)
                _available_tags.sort()
        _changed = False
        for _fname in _filenames:
            _current = saved_tags_map.get(_fname, infer_doc_tags(_fname))
            _current = sorted(set(_current))
            _selected = st.multiselect(f"Tags for {_fname}", options=_available_tags, default=_current, key=f"tags_{_fname}")
            if _selected != _current:
                saved_tags_map[_fname] = _selected
                _changed = True
        if st.button("Save tags"):
            try:
                with open(tags_path, "w", encoding="utf-8") as _f:
                    json.dump(saved_tags_map, _f, ensure_ascii=False, indent=2)
                st.success("Tags saved. Rebuilding index…")
                try:
                    st.rerun()
                except Exception:
                    try:
                        st.experimental_rerun()
                    except Exception:
                        pass
            except Exception as _e:
                st.error(f"Failed to save tags: {_e}")

# Expose docs for later sections
docs = _docs

# --- Tag Filter UI (top-level) ---
tag_set = set()
for d in docs:
    for t in d.metadata.get("doc_tags", []) or [d.metadata.get("doc_tag", "general")]:
        tag_set.add(t)
available_tags = sorted(tag_set)

# Persist selected tags across reruns
_default_tags = st.session_state.get("selected_tags", [])
selected_tags = st.sidebar.multiselect(
    "Filter by document tag",
    options=available_tags,
    default=_default_tags,
)
# Save latest selection
st.session_state["selected_tags"] = selected_tags

col_clear, col_all = st.sidebar.columns(2)
if col_clear.button("Clear", use_container_width=True):
    st.session_state['selected_tags'] = []
    try:
        st.rerun()
    except Exception:
        st.experimental_rerun()
if col_all.button("All", use_container_width=True):
    st.session_state['selected_tags'] = available_tags
    try:
        st.rerun()
    except Exception:
        st.experimental_rerun()

# --- Persistent Index per (session_id, version) ---
index_dir = os.path.join(version_dir, "index")
index = None

# Read on-disk signature (if any) to decide whether to reuse or rebuild
sig_path = os.path.join(index_dir, "signature.txt")
on_disk_sig = None
if os.path.exists(sig_path):
    try:
        with open(sig_path, "r", encoding="utf-8") as f:
            on_disk_sig = f.read().strip()
    except Exception:
        on_disk_sig = None

    # Maintenance controls (quick actions)
    with st.sidebar.expander("Cache & index maintenance", expanded=False):
        col1, col2 = st.columns(2)
        if col1.button("Rebuild index", use_container_width=True, key="rebuild_index_btn"):
            import shutil
            try:
                shutil.rmtree(index_dir)
            except Exception:
                pass
            os.makedirs(index_dir, exist_ok=True)
            st.success("Index cache cleared. It will rebuild on next run.")
            try:
                st.rerun()
            except Exception:
                try:
                    st.experimental_rerun()
                except Exception:
                    pass
        if col2.button("Clear QA cache", use_container_width=True, key="clear_cache_maint_btn"):
            try:
                import sqlite3
                with sqlite3.connect(cache_db_path) as _c:
                    _c.execute("DROP TABLE IF EXISTS qa_cache")
                    _c.commit()
            except Exception:
                pass
            st.success("QA cache cleared.")

    # --- Health & Stats panel ---
    with st.sidebar.expander("Health & Stats", expanded=False):
        # Document stats
        _doc_files = sorted({d.metadata.get("filename", "Unknown") for d in docs})
        _doc_count = len(_doc_files)
        _page_count = len(docs)
        _all_tags = set()
        for d in docs:
            for t in d.metadata.get("doc_tags", []) or [d.metadata.get("doc_tag", "general")]:
                _all_tags.add(t)
        _tag_count = len(_all_tags)

        # Index signature & build time
        _build_time = None
        try:
            if os.path.exists(sig_path):
                _build_time = datetime.fromtimestamp(os.path.getmtime(sig_path)).isoformat(sep=' ', timespec='seconds')
        except Exception:
            _build_time = None

        # QA cache counts
        _total_rows = 0
        _fresh_rows = 0
        try:
            import time as _time
            with sqlite3.connect(cache_db_path) as _conn:
                _conn.execute(
                    """
                    CREATE TABLE IF NOT EXISTS qa_cache (
                        cache_key TEXT PRIMARY KEY,
                        query TEXT,
                        tags TEXT,
                        strict INTEGER,
                        answer TEXT,
                        created_at REAL,
                        index_sig TEXT
                    )
                    """
                )
                _total_rows = _conn.execute("SELECT COUNT(*) FROM qa_cache").fetchone()[0]
                _fresh_rows = _conn.execute(
                    "SELECT COUNT(*) FROM qa_cache WHERE index_sig = ? AND (? - IFNULL(created_at,0)) <= ?",
                    (current_index_sig, _time.time(), QA_CACHE_TTL_SECONDS),
                ).fetchone()[0]
        except Exception:
            pass

        st.markdown(f"**Docs:** {_doc_count}  ·  **Pages indexed:** {_page_count}  ·  **Tags:** {_tag_count}")
        st.markdown(f"**Index signature:** `{current_index_sig}`")
        st.markdown(f"**Last build:** {(_build_time or '—')}")
        st.markdown(f"**QA cache:** {_fresh_rows}/{_total_rows} fresh (TTL {QA_CACHE_TTL_SECONDS}s)")

        _c1, _c2 = st.columns(2)
        if _c1.button("Prune QA cache", use_container_width=True, key="prune_cache_health_btn"):
            try:
                d_old, d_ttl = qa_cache_prune()
                st.success(f"Pruned: old_sig={d_old}, ttl={d_ttl}")
            except Exception as _e:
                st.error(f"Prune failed: {_e}")
        if _c2.button("Clear QA cache", use_container_width=True, key="clear_cache_health_btn"):
            try:
                with sqlite3.connect(cache_db_path) as _c:
                    _c.execute("DROP TABLE IF EXISTS qa_cache")
                    _c.commit()
                st.success("QA cache cleared.")
            except Exception as _e:
                st.error(f"Clear failed: {_e}")

# Always define required_files and has_all after sig_path and on_disk_sig assignment
required_files = ["docstore.json", "index_store.json", "vector_store.json"]
has_all = os.path.isdir(index_dir) and all(
    os.path.exists(os.path.join(index_dir, f)) for f in required_files
)

if has_all and (on_disk_sig is not None) and (on_disk_sig == current_index_sig):
    # Perfect cache hit: signatures match, load directly
    try:
        with st.spinner("Loading existing index…"):
            storage_context = StorageContext.from_defaults(persist_dir=index_dir)
            index = load_index_from_storage(storage_context)
        st.success("Index loaded from disk.")
    except Exception as e:
        st.warning(f"Existing index appears corrupted (will rebuild): {e}")
        import shutil
        try:
            shutil.rmtree(index_dir)
        except Exception:
            pass
        os.makedirs(index_dir, exist_ok=True)
        index = None
elif has_all and (on_disk_sig is not None) and (on_disk_sig != current_index_sig):
    # Index exists but docs/tags changed; rebuild cleanly
    st.info("Documents changed since last build. Rebuilding index…")
    import shutil
    try:
        shutil.rmtree(index_dir)
    except Exception:
        pass
    os.makedirs(index_dir, exist_ok=True)
    index = None
else:
    # No complete index; if there's any residue, wipe and rebuild
    if os.path.isdir(index_dir) and any(os.scandir(index_dir)):
        st.info("Found incomplete index cache. Rebuilding…")
        import shutil
        try:
            shutil.rmtree(index_dir)
        except Exception:
            pass
        os.makedirs(index_dir, exist_ok=True)
    index = None

# If not loaded, attempt fast-path reload if signature matches
if index is None:
    existing_sig = None
    try:
        if os.path.exists(sig_path):
            with open(sig_path, "r", encoding="utf-8") as f:
                existing_sig = f.read().strip()
    except Exception:
        existing_sig = None

    if existing_sig and existing_sig == current_index_sig:
        try:
            with st.spinner("Loading cached index…"):
                storage_context = StorageContext.from_defaults(persist_dir=index_dir)
                index = load_index_from_storage(storage_context)
            st.success("Index loaded from disk.")
        except Exception:
            index = None  # fall through and rebuild

if index is None:
    with st.spinner("Building index (first time)…"):
        # Create a fresh storage context for a new build (no persist_dir yet)
        storage_context = StorageContext.from_defaults()

        # Build the index
        index = VectorStoreIndex.from_documents(
            docs,
            storage_context=storage_context,
            show_progress=True,
        )

        # Persist to disk so subsequent loads are instant
        index.storage_context.persist(persist_dir=index_dir)

        # Save the current signature alongside the index
        try:
            with open(sig_path, "w", encoding="utf-8") as f:
                f.write(current_index_sig)
        except Exception:
            pass

    st.success("Index built and saved.")

# --- Retrieval setup ---
# Use similarity_top_k=16 for vector retriever
# --- Strict mode toggle ---
strict_mode = st.sidebar.toggle("Strict mode (exact matches only)", value=False)

# --- Custom retriever weighting for "pdf" boost ---
from llama_index.core.retrievers import VectorIndexRetriever
class PDFBoostRetriever(VectorIndexRetriever):
    def _get_scored_nodes(self, query_bundle, nodes_with_scores, **kwargs):
        # nodes_with_scores: List[NodeWithScore]
        boosted = []
        for n in nodes_with_scores:
            meta = getattr(n.node, "metadata", {})
            source_type = meta.get("source_type", "")
            score = n.score
            if source_type == "pdf":
                score += 0.08  # increased boost
            boosted.append(type(n)(node=n.node, score=score))
        return boosted

# If strict_mode, wrap retriever to filter by exact keyword match before semantic ranking
import re

def keyword_filter(nodes, query):
    query_terms = set(re.findall(r"\w+", query.lower()))
    filtered = []
    for node in nodes:
        text = node.text.lower()
        if any(term in text for term in query_terms):
            filtered.append(node)
    return filtered

# Build custom retriever
if strict_mode:
    # Filter nodes by exact keyword match before ranking
    class StrictKeywordRetriever(VectorIndexRetriever):
        def retrieve(self, str_or_query_bundle, *args, **kwargs):
            nodes = super().retrieve(str_or_query_bundle, *args, **kwargs)
            query = str_or_query_bundle.query_str if hasattr(str_or_query_bundle, "query_str") else str_or_query_bundle
            filtered = []
            for n in nodes:
                text = getattr(n.node, "text", "") or getattr(n.node, "get_content", lambda: "")()
                if any(term in text.lower() for term in re.findall(r"\w+", query.lower())):
                    filtered.append(n)
            return filtered
    vector_retriever = StrictKeywordRetriever(index, similarity_top_k=20)
else:
    vector_retriever = PDFBoostRetriever(index, similarity_top_k=20)

retrievers = [vector_retriever]

# Optionally add BM25 if available
if BM25_AVAILABLE and BM25Retriever is not None:
    try:
        # Build a BM25 retriever over the index's nodes
        try:
            # Preferred: get nodes from the index/docstore
            node_ids = list(index.docstore.get_all_node_ids())
            nodes = [index.docstore.get_node(nid) for nid in node_ids]
        except Exception:
            # Fallback: reconstruct from docs loaded this run
            from llama_index.core.schema import TextNode
            nodes = [TextNode(text=d.text, metadata=d.metadata) for d in docs]
        class PDFBoostBM25Retriever(BM25Retriever):
            def _get_scored_nodes(self, query_bundle, nodes_with_scores, **kwargs):
                boosted = []
                for n in nodes_with_scores:
                    meta = getattr(n.node, "metadata", {})
                    source_type = meta.get("source_type", "")
                    score = n.score
                    if source_type == "pdf":
                        score += 0.08
                    boosted.append(type(n)(node=n.node, score=score))
                return boosted
        bm25_retriever = PDFBoostBM25Retriever(nodes=nodes, similarity_top_k=20)
        retrievers.append(bm25_retriever)
    except Exception as e:
        if DEV_HINTS:
            try:
                import streamlit as st
                st.info(f"BM25 unavailable in this environment (falling back to vector-only): {e}")
            except Exception:
                pass

# --- Tag filter postprocessor ---
try:
    from llama_index.core.postprocessor.types import BaseNodePostprocessor
except Exception:
    try:
        from llama_index.core.postprocessor import BaseNodePostprocessor  # fallback older versions
    except Exception:
        BaseNodePostprocessor = None

# Custom TagFilterPostprocessor that works across LlamaIndex versions
from typing import List, Optional, Set
try:
    # Newer versions
    from llama_index.core.schema import NodeWithScore, QueryBundle
except Exception:
    # Back-compat fallbacks
    try:
        from llama_index.core.schema import NodeWithScore
    except Exception:
        NodeWithScore = None  # type: ignore
    try:
        from llama_index.core.query import QueryBundle  # type: ignore
    except Exception:
        QueryBundle = None  # type: ignore

class TagFilterPostprocessor(BaseNodePostprocessor if BaseNodePostprocessor else object):
    # Define as a Pydantic field so assignment is allowed when BaseNodePostprocessor is a BaseModel
    allowed: Set[str] = set()

    def __init__(self, allowed: Optional[Set[str]] = None, **kwargs):  # type: ignore[override]
        # When BaseNodePostprocessor is a BaseModel, super().__init__ will handle fields
        if BaseNodePostprocessor:
            super().__init__(**kwargs)
        if allowed is not None:
            # Assign through __setattr__ which is allowed because the field is declared above
            self.allowed = set(allowed)

    # For newer LlamaIndex versions, implement _postprocess_nodes (called by postprocess_nodes)
    def _postprocess_nodes(self, nodes: List["NodeWithScore"], query_bundle: Optional["QueryBundle"] = None) -> List["NodeWithScore"]:  # type: ignore[name-defined]
        try:
            allowed = set(self.allowed)
        except Exception:
            allowed = set()
        if not allowed:
            return nodes
        kept: List["NodeWithScore"] = []
        for n in nodes:
            meta = getattr(n, "metadata", None)
            if not meta:
                node_obj = getattr(n, "node", None)
                meta = getattr(node_obj, "metadata", {}) if node_obj else {}
            tags = []
            if meta:
                if isinstance(meta.get("doc_tags"), (list, tuple)):
                    tags = list(meta.get("doc_tags"))
                elif meta.get("doc_tag"):
                    tags = [meta.get("doc_tag")]
            if any(t in allowed for t in tags):
                kept.append(n)
        return kept

    # For older versions that directly call postprocess_nodes
    def postprocess_nodes(self, nodes, query_bundle=None):  # type: ignore[override]
        # Use the same multi-tag logic as above
        return self._postprocess_nodes(nodes, query_bundle)

# Build fusion retriever
# Add postprocessors: TagFilter (if any), LongContextReorder, LLMRerank (OpenAI) n_to_rerank=40, top_n=5, then SimilarityPostprocessor (cutoff=0.30)
postprocessors = []
# Tag filter first (if user selected tags)
if selected_tags:
    postprocessors.append(TagFilterPostprocessor(allowed=set(selected_tags)))

from llama_index.core.postprocessor import LongContextReorder
postprocessors.append(LongContextReorder())

# Try to import LLMRerank and configure OpenAI reranker for n_to_rerank=40 -> top_n=5
llm_reranker = None
try:
    try:
        from llama_index.postprocessor.llm_rerank import LLMRerank
    except ImportError:
        from llama_index.core.postprocessor.llm_rerank import LLMRerank
    llm_reranker = LLMRerank(
        top_n=5,
        choice_batch_size=4,
        llm=Settings.llm,
        model="gpt-3.5-turbo",
        n_to_rerank=40,
    )
    postprocessors.append(llm_reranker)
    # Add SimilarityPostprocessor after reranker with stricter cutoff
    from llama_index.core.postprocessor import SimilarityPostprocessor
    postprocessors.append(SimilarityPostprocessor(cutoff=0.30))
except Exception:
    pass

if HYDE_AVAILABLE and HyDEQueryTransform is not None:
    hyde = HyDEQueryTransform(llm=Settings.llm)
    fusion_retriever = QueryFusionRetriever(
        retrievers=retrievers,
        query_transform=hyde,
        num_queries=3,
        mode="reciprocal_rerank",
        similarity_top_k=20,
    )
    query_engine = RetrieverQueryEngine.from_args(
        fusion_retriever,
        llm=Settings.llm,
        node_postprocessors=postprocessors,
    )
else:
    # No HyDE: still fuse multiple retrievers if BM25 is available
    if len(retrievers) > 1:
        fusion_retriever = QueryFusionRetriever(
            retrievers=retrievers,
            mode="reciprocal_rerank",
            similarity_top_k=20,
        )
        query_engine = RetrieverQueryEngine.from_args(
            fusion_retriever,
            llm=Settings.llm,
            node_postprocessors=postprocessors,
        )
    else:
        # Vector-only fallback
        query_engine = RetrieverQueryEngine.from_args(
            vector_retriever,
            llm=Settings.llm,
            node_postprocessors=postprocessors,
        )
        if DEV_HINTS:
            try:
                import streamlit as st
                st.info(
                    "HyDE not available; using vector-only retrieval. Upgrade to enable HyDE: "
                    'python3 -m pip install "llama-index>=0.10.55"'
                )
            except Exception:
                pass


    # --- Query panel ---
    past_queries_data = []
    past_queries = 0
    if supabase:
        try:
            response = supabase.table("queries").select("*").eq("session_id", session_id).eq("version", version).order("timestamp", desc=True).execute()
            past_queries_data = response.data or []
            past_queries = len(past_queries_data)
        except Exception as e:
            st.sidebar.error(f"Failed to fetch past queries: {e}")

    if past_queries >= 20:
        st.warning("You’ve reached the maximum number of queries (20) for this session/version.")
    else:
        query = st.text_input("Ask your question across all documents:")
        # Small manage-tags button under the input
        c1, c2 = st.columns([1, 6])
        with c1:
            if st.button("Manage tags", help="Open the sidebar Manage tags panel"):
                st.session_state["open_manage_tags"] = True
                try:
                    st.rerun()
                except Exception:
                    st.experimental_rerun()

        # Quick tag chip bar (toggle tags on/off)
        if 'selected_tags' not in st.session_state:
            st.session_state['selected_tags'] = selected_tags
        chip_cols = st.columns(min(len(available_tags), 6) or 1)
        for i, t in enumerate(sorted(available_tags)):
            col = chip_cols[i % len(chip_cols)]
            active = t in st.session_state['selected_tags']
            label = ("✓ " if active else "○ ") + t
            if col.button(label, key=f"chip_{t}"):
                cur = set(st.session_state['selected_tags'])
                if active:
                    cur.discard(t)
                else:
                    cur.add(t)
                st.session_state['selected_tags'] = sorted(cur)
                try:
                    st.rerun()
                except Exception:
                    st.experimental_rerun()

        if query:
            # --- Tag-aware catalog shortcut -------------------------------------------
            import re as _re
            normalized_q = (query or "").strip().lower()
            meta_q_patterns = [
                r"\bwhat (?:information|content|docs?|documents|topics).*(?:tag|these tags)\b",
                r"\bwhat can i find (?:here|with this tag|under this tag)\b",
                r"\bwhat's in (?:this|the) tag\b",
                r"\blist (?:docs?|documents|files) (?:in|under) (?:this )?tag\b",
            ]
            is_meta_q = any(_re.search(p, normalized_q) for p in meta_q_patterns)
            if is_meta_q:
                st.subheader("Answer")
                # Build a lightweight catalog of the currently scoped/tag-filtered docs
                # Use the in-memory `docs` list and the sidebar-selected tags
                def _doc_tags(meta: dict) -> list[str]:
                    t = meta.get("doc_tags")
                    if isinstance(t, (list, tuple)):
                        return list(t)
                    dt = meta.get("doc_tag")
                    return [dt] if dt else ["general"]

                def _matches_selected(meta: dict) -> bool:
                    if not selected_tags:
                        return True
                    return bool(set(_doc_tags(meta)).intersection(selected_tags))

                # Group by filename and gather simple headings from the first page or two
                from collections import defaultdict
                grouped: dict[str, dict] = defaultdict(lambda: {"count": 0, "snippets": []})
                for d in docs:
                    meta = getattr(d, "metadata", {}) or {}
                    if not _matches_selected(meta):
                        continue
                    fname = meta.get("filename", "Unknown")
                    grouped[fname]["count"] += 1
                    # Collect up to a few candidate headings/snippets per file
                    if len(grouped[fname]["snippets"]) < 6:
                        # Heuristic: pick title-like lines
                        lines = [ln.strip() for ln in (d.text or "").splitlines() if ln.strip()]
                        for ln in lines:
                            if 6 <= len(ln) <= 100 and ln[-1].isalnum() and not any(ch.isdigit() for ch in ln[:6]):
                                if ln.isupper() or ln.istitle() or _re.match(r"^[A-Z][A-Za-z0-9 .,&()/-]{5,}$", ln):
                                    if ln.lower() not in {s.lower() for s in grouped[fname]["snippets"]}:
                                        grouped[fname]["snippets"].append(ln)
                            if len(grouped[fname]["snippets"]) >= 6:
                                break

                if not grouped:
                    st.write("_No documents match the current tag filter._")
                else:
                    st.markdown("Here’s what’s available under the current **tag filter**:")
                    for fname, info in sorted(grouped.items()):
                        page_note = f" ({info['count']} pages indexed)" if info["count"] > 1 else ""
                        st.markdown(f"- **{fname}**{page_note}")
                        if info["snippets"]:
                            for snip in info["snippets"][:5]:
                                st.markdown(f"    • {snip}")
                # Short-circuit normal QA for meta questions
                st.stop()
            # --- End Tag-aware catalog shortcut --------------------------------------

            # --- Inject Memory Context ---
            memory_qas = []
            for past in past_queries_data[:5]:
                memory_qas.append(f"Q: {past['question']}\nA: {past['answer']}")
            memory_context = "\n\n".join(memory_qas)

            # Combine memory with current query
            enriched_query = f"Previous interactions:\n{memory_context}\n\nCurrent question:\n{query}"

            # --- System-level strict QA prompt ---
            system_instruction = (
                "You are a strict retrieval QA system. Use only the provided context to answer. "
                "Always cite page numbers and quote 1–2 short relevant excerpts. "
                "If the context does not answer the question, respond with: \"Not in the provided documents.\""
            )
            # The prompt must be used for all answers; inject as a system message or prepend to query
            # --- Streaming support for answers ---
            import time
            # Show active document tag filters (if any)
            if selected_tags:
                # lightweight chip styling
                st.markdown(
                    """
                    <style>
                    .tag-chip {display:inline-block;padding:2px 8px;margin-right:6px;margin-bottom:4px;
                               border:1px solid #888;border-radius:12px;font-size:0.85em;}
                    </style>
                    """,
                    unsafe_allow_html=True,
                )
                chips_html = " ".join(f"<span class='tag-chip'>{t}</span>" for t in selected_tags)
                st.markdown(f"**Active tags:** {chips_html}", unsafe_allow_html=True)
            st.subheader("Answer")
            answer_placeholder = st.empty()
            full_answer = ""
            response = None
            try:
                # Try streaming interface if available
                stream_kwargs = {}
                # LlamaIndex >=0.10.55 supports streaming=True for RetrieverQueryEngine
                try:
                    response_stream = query_engine.query(
                        enriched_query,
                        system_prompt=system_instruction,
                        streaming=True,
                    )
                except TypeError:
                    # Fallback: prepend to query if system_prompt not supported
                    prompt_query = f"{system_instruction}\n\n{enriched_query}"
                    response_stream = query_engine.query(prompt_query, streaming=True)
                # response_stream is a generator yielding tokens or chunks
                for chunk in response_stream:
                    token = getattr(chunk, "delta", None) or getattr(chunk, "text", None) or str(chunk)
                    if token:
                        full_answer += token
                        answer_placeholder.markdown(full_answer)
                # If final response object is yielded, try to capture it
                if hasattr(response_stream, "response"):
                    response = response_stream
                else:
                    # Try to re-run for sources (and support cache)
                    # (not ideal, but LlamaIndex streaming API may not return sources in chunks)
                    # 1) Check cache
                    try:
                        _cached = qa_cache_get(
                            enriched_query,
                            st.session_state.get("selected_tags", selected_tags),
                            strict_mode,
                        )
                    except Exception:
                        _cached = None
                    if _cached:
                        st.info("Answer from cache")
                        st.write(_cached)
                        st.stop()

                    # 2) Run query (non‑streaming) to collect sources
                    try:
                        response = query_engine.query(
                            enriched_query,
                            system_prompt=system_instruction,
                        )
                    except TypeError:
                        prompt_query = f"{system_instruction}\n\n{enriched_query}"
                        response = query_engine.query(prompt_query)

                    # 3) Cache the result
                    try:
                        qa_cache_set(
                            enriched_query,
                            st.session_state.get("selected_tags", selected_tags),
                            strict_mode,
                            getattr(response, "response", None) or response,
                        )
                    except Exception:
                        pass
            except Exception as e:
                # Fallback to non-streaming
                try:
                    response = query_engine.query(
                        enriched_query,
                        system_prompt=system_instruction
                    )
                except TypeError:
                    prompt_query = f"{system_instruction}\n\n{enriched_query}"
                    response = query_engine.query(prompt_query)
                full_answer = response.response
                answer_placeholder.markdown(full_answer)
            if not (full_answer or "").strip():
                answer_placeholder.markdown("_Not in the provided documents._")

            # --- Logging ---
            if supabase and response:
                try:
                    supabase.table("queries").insert({
                        "session_id": session_id,
                        "version": version,
                        "question": query,
                        "answer": response.response,
                        "sources": [node.metadata.get("filename", "Unknown") for node in response.source_nodes],
                        "timestamp": datetime.utcnow().isoformat()
                    }).execute()
                except Exception as e:
                    st.error(f"Failed to log query: {e}")

            # --- Highlight matched query terms in answer and sources ---
            import re
            def highlight_terms(text, terms):
                def repl(m):
                    return f"**{m.group(0)}**"
                for term in sorted(set(terms), key=len, reverse=True):
                    if not term.strip():
                        continue
                    # Use word boundaries for whole word match
                    text = re.sub(rf"\b({re.escape(term)})\b", repl, text, flags=re.IGNORECASE)
                return text

            query_terms = re.findall(r"\w+", query)
            # Highlight in answer
            if full_answer:
                highlighted_answer = highlight_terms(full_answer, query_terms)
                answer_placeholder.markdown(highlighted_answer)

            # --- Copy buttons ---
            import streamlit.components.v1 as components
            st.markdown(
                """
                <style>
                .copy-btn {margin-right: 0.5em;}
                </style>
                """,
                unsafe_allow_html=True,
            )
            copy_answer_btn = st.button("Copy Answer")
            copy_citations_btn = st.button("Copy Citations")
            # Prepare citations block
            citations_md = ""
            seen = set()
            for sn in getattr(response, "source_nodes", []):
                meta = getattr(sn, "metadata", None) or getattr(sn.node, "metadata", {})
                fname = meta.get("filename", "Unknown")
                page = meta.get("page")
                key = (fname, page)
                if key in seen:
                    continue
                seen.add(key)
                snippet = ""
                try:
                    text = getattr(sn, "text", None) or sn.node.get_content()
                    snippet = (text or "").strip().replace("\n", " ")
                    if len(snippet) > 220:
                        snippet = snippet[:220] + "…"
                    snippet = highlight_terms(snippet, query_terms)
                except Exception:
                    pass
                label = f"- {fname}" + (f" (p. {page})" if page else "")
                if snippet:
                    citations_md += f"{label}\n\n> {snippet}\n\n"
                else:
                    citations_md += f"{label}\n\n"
            # Copy-to-clipboard JS
            if copy_answer_btn:
                components.html(
                    f"""
                    <script>
                    navigator.clipboard.writeText({repr(full_answer)});
                    </script>
                    <div>Copied answer to clipboard!</div>
                    """, height=30
                )
            if copy_citations_btn:
                components.html(
                    f"""
                    <script>
                    navigator.clipboard.writeText({repr(citations_md)});
                    </script>
                    <div>Copied citations to clipboard!</div>
                    """, height=30
                )

            st.subheader("Sources")
            if citations_md:
                st.markdown(citations_md)
            else:
                st.markdown("_No sources found._")

            # --- DEV_HINTS: Print debug info ---
            if DEV_HINTS and response:
                print("DEBUG: Retrieved nodes:")
                for sn in getattr(response, "source_nodes", []):
                    meta = getattr(sn, "metadata", None) or getattr(sn.node, "metadata", {})
                    print(f"  Node ID: {getattr(sn, 'node_id', None)}, Score: {getattr(sn, 'score', None)}, Meta: {meta}")

    # Query history with search

    # Query history with search
    st.sidebar.markdown("## Query Log")

    search_term = st.sidebar.text_input("Search query log:")

    if past_queries_data:
        for q in past_queries_data:
            if search_term.lower() in q["question"].lower():
                st.sidebar.markdown("---")
                st.sidebar.markdown(f"**[{q['timestamp']}]**")
                st.sidebar.markdown(f"**Q:** {q['question']}")
                st.sidebar.markdown(f"**A:** {q['answer']}")
                for source in q["sources"]:
                    st.sidebar.markdown(f"*{source}*")
    else:
        st.sidebar.markdown("_No queries logged for this session/version._")

    # --- Supabase connection test (optional, safe to remove later) ---
    if supabase:
        try:
            response = supabase.table("your_table_name").select("*").execute()
            st.sidebar.success("Supabase connected. Retrieved rows:")
            st.sidebar.write(response.data)
        except Exception as e:
            st.sidebar.error(f"Supabase error: {e}")
    else:
        st.sidebar.info("Supabase is not configured. Set SUPABASE_URL and SUPABASE_KEY in your .env to enable logging.")

if not authentication_status:
    st.stop()

# --- Evaluation harness (optional) ---
with st.sidebar.expander("Evaluation", expanded=False):
    st.caption("Run quick baseline tests to verify retrieval accuracy.")
    run_eval = st.button("Run tests")
    if run_eval:
        import json
        test_path = os.path.join(os.getcwd(), "tests.json")
        if os.path.exists(test_path):
            with open(test_path, "r") as f:
                tests = json.load(f)
        else:
            # Build default tests from loaded docs
            tests = []
            for d in docs:
                fname = d.metadata.get("filename", "")
                if "BankID" in fname:
                    tests.append({"query": "What are the base URLs for TEST and PROD?", "expected_contains": "test-gateway.zignsec.com"})
                if "Mobile SDK" in fname or "ID & Bio" in fname:
                    tests.append({"query": "How do I request NNIN during onboarding?", "expected_contains": "nnin"})
            # Deduplicate
            seen_q = set()
            tests = [t for t in tests if not (t["query"] in seen_q or seen_q.add(t["query"]))]
        st.write(f"Loaded {len(tests)} tests")
        pass_count = 0
        for test in tests:
            q = test.get("query", "")
            expected = test.get("expected_contains", "")
            try:
                resp = query_engine.query(q)
                answer = getattr(resp, "response", str(resp))
                passed = expected.lower() in answer.lower()
                if passed:
                    st.success(f"PASS: {q}")
                    pass_count += 1
                else:
                    st.error(f"FAIL: {q}")
                st.caption(f"Expected fragment: `{expected}`")
                st.markdown(f"**Answer preview:** {answer[:200]}{'...' if len(answer) > 200 else ''}")
                # Show first source
                if getattr(resp, "source_nodes", []):
                    first_src = resp.source_nodes[0].metadata.get("filename", "Unknown")
                    st.caption(f"First source: {first_src}")
            except Exception as e:
                st.error(f"Error running test '{q}': {e}")
        st.info(f"Passed {pass_count}/{len(tests)} tests")