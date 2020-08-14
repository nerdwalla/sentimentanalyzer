# -*- coding: utf-8 -*-
"""
Created on Mon Aug 10 10:21:02 2020

@author: venka
"""

import re
import sys
from google.cloud import language
from google.cloud.language import enums
from google.cloud.language import types
from nltk.tokenize import WordPunctTokenizer
from bs4 import BeautifulSoup as soup  # HTML data structure
from urllib.request import urlopen as uReq  # Web client
from decimal import Decimal
import os

contents_to_avoid = ["so businesses can't pay to alter or remove their reviews.", "your trust is our top concern"]

def search_reviews(business_url):
    if not business_url:
        return
    uClient = uReq(business_url)
    
    # parses html into a soup data structure to traverse html
    # as if it were a json data type.
    page_soup = soup(uClient.read(), "html.parser")
    uClient.close()
       
    reviews = page_soup.findAll("p", {"class": "lemon--p__373c0__3Qnnj text__373c0__2Kxyz comment__373c0__3EKjH text-color--normal__373c0__3xep9 text-align--left__373c0__2XGa-"})
    return reviews

def clean_review(review):
    user_removed = re.sub(r'@[A-Za-z0-9]+','',review.decode('utf-8'))
    line_spaces_removed = re.sub(r"(?<=[a-z])\r?\n"," ", user_removed)
    link_removed = re.sub('https?://[A-Za-z0-9./]+','',line_spaces_removed )
    number_removed = re.sub('[^a-zA-Z]', ' ', link_removed)
    lower_case_review= number_removed.lower()
    tok = WordPunctTokenizer()
    words = tok.tokenize(lower_case_review)
    clean_review = (' '.join(words)).strip()
    return clean_review

def analyze_reviews(business_url):
    reviews = search_reviews(business_url)
  
    for review in reviews:
        cleaned_review = clean_review(review.span.text.encode('utf-8'))
        if cleaned_review not in contents_to_avoid:
            print(review)
            print(cleaned_review)
            
    sys.stdout.flush()

def main():
    url = sys.argv[1]
    analyze_reviews(url)


if __name__ == '__main__':
    main()