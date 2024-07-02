# WORD_LIST = ["alex "]

MY_WORD_LIST  = []


with open("wordlist.txt") as f:
    lines = f.readlines()
    for line in lines:
        MY_WORD_LIST.append(line.strip())




