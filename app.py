import streamlit as st
from llama_index.core import VectorStoreIndex, Document
from PyPDF2 import PdfReader
from io import StringIO
import os
from datetime import datetime

st.set_page_config(page_title="Onbo - AI-Powered API Assistant")
st.title("Onbo: AI-Powered API Assistant")

# Input for session and version
session_id = st.text_input("Enter a session ID (e.g., client name):", value="default")
version = st.text_input("Enter a version for this session (e.g., v1, prod):", value="v1")
version_dir = os.path.join("sessions", session_id, version)
os.makedirs(version_dir, exist_ok=True)

# Load existing documents
docs = []
for filename in os.listdir(version_dir):
    file_path = os.path.join(version_dir, filename)
    file_type = filename.split(".")[-1]

    if file_type == "txt":
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
    elif file_type == "pdf":
        reader = PdfReader(file_path)
        content = "\n\n".join(page.extract_text() for page in reader.pages if page.extract_text())
    else:
        continue

    doc = Document(text=content, metadata={"filename": filename})
    docs.append(doc)

# Upload new files
uploaded_files = st.file_uploader("Upload API docs (.txt or .pdf)", type=["txt", "pdf"], accept_multiple_files=True)

if uploaded_files:
    for uploaded_file in uploaded_files:
        file_path = os.path.join(version_dir, uploaded_file.name)
        if not os.path.exists(file_path):
            with open(file_path, "wb") as f:
                f.write(uploaded_file.getbuffer())

            file_type = uploaded_file.name.split(".")[-1]
            if file_type == "txt":
                content = StringIO(uploaded_file.getvalue().decode("utf-8")).read()
            elif file_type == "pdf":
                reader = PdfReader(uploaded_file)
                content = "\n\n".join(page.extract_text() for page in reader.pages if page.extract_text())
            else:
                continue

            doc = Document(text=content, metadata={"filename": uploaded_file.name})
            docs.append(doc)

# Show files
if docs:
    st.markdown(f"### Documents for session `{session_id}` version `{version}`:")
    for doc in docs:
        st.markdown(f"- {doc.metadata['filename']}")

    index = VectorStoreIndex.from_documents(docs)
    query_engine = index.as_query_engine()

    log_path = os.path.join(version_dir, "query_log.txt")
    past_queries = 0
    if os.path.exists(log_path):
        with open(log_path, "r", encoding="utf-8") as log_file:
            past_queries = sum(1 for line in log_file if line.startswith("Q:"))

    if past_queries >= 20:
        st.warning("You’ve reached the maximum number of queries (20) for this session/version.")
    else:
        query = st.text_input("Ask your question across all documents:")

        if query:
            response = query_engine.query(query)

            st.subheader("Answer")
            st.write(response.response)

            st.subheader("Sources")
            sources = set()
            for node in response.source_nodes:
                source = node.metadata.get("filename", "Unknown")
                sources.add(source)
            for source in sources:
                st.write(f"- {source}")

            with open(log_path, "a", encoding="utf-8") as log_file:
                log_file.write(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}]\n")
                log_file.write(f"Q: {query}\n")
                log_file.write(f"A: {response.response}\n")
                log_file.write("Sources:\n")
                for source in sources:
                    log_file.write(f"- {source}\n")
                log_file.write("\n")
else:
    st.info("Upload .txt or .pdf files to get started.")

# Query history with search
st.sidebar.markdown("## Query Log")
search_term = st.sidebar.text_input("Search query log:")
if os.path.exists(log_path):
    with open(log_path, "r", encoding="utf-8") as log_file:
        log_entries = log_file.read().strip().split("\n\n")
    for entry in reversed(log_entries):
        if search_term.lower() in entry.lower():
            st.sidebar.markdown("---")
            for line in entry.splitlines():
                if line.startswith("["):
                    st.sidebar.markdown(f"**{line}**")
                elif line.startswith("Q:"):
                    st.sidebar.markdown(f"**Question:** {line[3:]}")
                elif line.startswith("A:"):
                    st.sidebar.markdown(f"**Answer:** {line[3:]}")
                elif line.startswith("- "):
                    st.sidebar.markdown(f"*{line}*")
else:
    st.sidebar.markdown("_No queries yet for this session/version._")