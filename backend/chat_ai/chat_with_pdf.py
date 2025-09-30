from langchain.text_splitter import CharacterTextSplitter
from langchain.embeddings import SentenceTransformerEmbeddings
from langchain.vectorstores import FAISS
from langchain.chains.question_answering import load_qa_chain
from langchain.docstore.document import Document
from langchain.llms import HuggingFaceHub

# You can replace HuggingFaceHub with any LangChain-supported LLM
def ask_pdf_question(pdf_text, question):
    # 1. Chunk PDF text
    docs = [Document(page_content=pdf_text)]
    splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    chunks = splitter.split_documents(docs)

    # 2. Embed chunks
    embeddings = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
    db = FAISS.from_documents(chunks, embeddings)

    # 3. Search relevant chunks
    relevant_docs = db.similarity_search(question)

    # 4. Generate answer (Replace with your local LLM if needed)
    llm = HuggingFaceHub(
        repo_id="google/flan-t5-base", model_kwargs={"temperature": 0.2, "max_length": 512}
    )

    chain = load_qa_chain(llm, chain_type="stuff")
    result = chain.run(input_documents=relevant_docs, question=question)
    return result
