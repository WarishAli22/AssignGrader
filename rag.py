import fitz
import pandas as pd
from flask import request
from script import app
import json
import re
from sentence_transformers import util, SentenceTransformer
import torch
import numpy as np

# Create a function that recursively splits a list into desired sizes
def split_list(input_list: list, 
               slice_size: int) -> list[list[str]]:
    """
    Splits the input_list into sublists of size slice_size (or as close as possible).

    For example, a list of 17 sentences would be split into two lists of [[10], [7]]
    """
    return [input_list[i:i + slice_size] for i in range(0, len(input_list), slice_size)]


def getEmbeddings() -> list[dict]:

  # req = request.get_json()
  # print("request: ")
  # print(req)
  # pdf_path = req.pdfData[0].filepath
  pdf_path = "uploads/rag.pdf"
  #Minor text formatting: replaces new lines with spaces and strips the white spaces
  #This removes new lines
  doc = fitz.open(pdf_path)
  pdf_text = []
  for page_number, page in enumerate(doc):
    text = page.get_text()
    clean_text = text.replace("\n", " ").strip()
    pdf_text.append({"text" : clean_text,
                     "page_token_count" : len(text)/4
                     })

  # print("pdf_text: ")
  # for item in pdf_text:
  #    print(item)
  #    print("\n")
  # df = pd.DataFrame(pdf_text)
  # print(df.head())

  # Splitting Text into sentences using spacY
  from spacy.lang.en import English

  nlp = English()
  nlp.add_pipe("sentencizer")

  # doc = nlp("Hey there. How are you? Hope you're doing well.")
  # list(doc.sents) == 3
  # print(list(doc.sents));

  for item in pdf_text:
      item["sentences"] = list(nlp(item["text"]).sents)
    
      # Make sure all sentences are strings
      item["sentences"] = [str(sentence) for sentence in item["sentences"]]
    
      # Count the sentences 
      item["page_sentence_count_spacy"] = len(item["sentences"])

  # print("pdf_text with sentences: ")
  # for item in pdf_text:
  #    print(item)
  #    print("\n")
  # Chunking sentences together

    # Define split size to turn groups of sentences into chunks
  chunk_size = 5 
  # Loop through pages and texts and split sentences into chunks
  for item in pdf_text:
      item["sentence_chunks"] = split_list(input_list=item["sentences"],
                                         slice_size=chunk_size)
      item["num_chunks"] = len(item["sentence_chunks"])

  # print("pdf_text with sentence chunks: ")
  # for item in pdf_text:
  #    print(item)
  #    print("\n")


  # Split each chunk into its own item
  pages_and_chunks = []
  for item in pdf_text:
    for sentence_chunk in item["sentence_chunks"]:
        chunk_dict = {}
        
        # Join the sentences together into a paragraph-like structure, aka a chunk (so they are a single string)
        joined_sentence_chunk = "".join(sentence_chunk).replace("  ", " ").strip()
        joined_sentence_chunk = re.sub(r'\.([A-Z])', r'. \1', joined_sentence_chunk) # ".A" -> ". A" for any full-stop/capital letter combo 
        chunk_dict["sentence_chunk"] = joined_sentence_chunk

        # Get stats about the chunk
        chunk_dict["chunk_char_count"] = len(joined_sentence_chunk)
        chunk_dict["chunk_word_count"] = len([word for word in joined_sentence_chunk.split(" ")])
        chunk_dict["chunk_token_count"] = len(joined_sentence_chunk) / 4 # 1 token = ~4 characters
        
        pages_and_chunks.append(chunk_dict)

  # print("pages_and_chunks: ")
  # for item in pages_and_chunks:
  #    print(item)
  #    print("\n")
  # How many chunks do we have?

  # for item in pages_and_chunks:
  #   print(item["sentence_chunk"] + "\n")
  #   print("next")

  embedding_model = SentenceTransformer(model_name_or_path="all-mpnet-base-v2", 
                                      device="cpu") # choose the device to load the model to (note: GPU will often be *much* faster than CPU)


  # Sentences are encoded/embedded by calling model.encode()
  for item in pages_and_chunks:
    sentence = item["sentence_chunk"]
    embeddings = embedding_model.encode(sentence)
    item["embedding"] = embeddings


  # print("pages_and_chunks with embeddings: ")
  # for item in pages_and_chunks:
  #    print(item)
  #    print("\n")



  # sentence_list = []
  # for item in pages_and_chunks:
  #   sentence_list.append(item["sentence_chunk"])

  # text_chunks_and_embeddings_df = pd.DataFrame(pages_and_chunks)
  # embeddings = np.array(text_chunks_and_embeddings_df["embedding"].tolist())

  text_chunks_and_embeddings_df = pd.DataFrame(pages_and_chunks)
  # print(text_chunks_and_embeddings_df["embedding"])
  embeddings = np.array(text_chunks_and_embeddings_df["embedding"].tolist())
  # print(embeddings)

  sentence_chunk
  query = "Naive RAG"
  query_embedding = embedding_model.encode(query)
  dot_scores = util.cos_sim(a=query_embedding, b=embeddings)[0]
  top_results_dot_product = torch.topk(dot_scores, k=len(embeddings))
  print(top_results_dot_product)

  i=1; j=0; senc_arr = []
  while(i<2):
    if(len(top_results_dot_product[1]) >=2):
      while(j<2):
        senc_arr.append(pages_and_chunks[top_results_dot_product[1][j]]["sentence_chunk"])
        j+=1
    elif(len(top_results_dot_product[1]) == 1):
       while(j<1):
        senc_arr.append(pages_and_chunks[top_results_dot_product[1][j]]["sentence_chunk"])
        j+=1

    sentence_chunk = ' '.join(senc_arr)
    i+=1

  print(sentence_chunk)

  
  
  # for score, indices in zip(top_results_dot_product[0], top_results_dot_product[1]):
  #    print(f"Score: {score}")
  #    print(f"Text: ")
  #    print(pages_and_chunks[indices]["sentence_chunk"])

getEmbeddings()



