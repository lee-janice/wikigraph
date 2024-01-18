import re

ignore_list = ["other", "other-empty", "other-external", "other-internal", "other-other", "other-search"]

with open('path-to-tsv', 'r') as tsv:
    with open('path-to-csv', 'w') as csv:
        for line in tsv:
            # skip lines that contain words that are in the ignore list
            if set(line.split("\t")) & set(ignore_list):
                continue
            else :
                content = re.sub(",", "", line)      # replace every comma with an empty string
                content = re.sub("_", " ", content)  # replace every underscore with a space
                content = re.sub('"', "", content)   # replace every " with an empty string
                content = re.sub("\t", ",", content) # replace every tab with a comma
                csv.write(content)