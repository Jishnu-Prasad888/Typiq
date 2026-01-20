import os

root_dir = "typiq"

for root, dirs, files in os.walk(root_dir):
    print(f"Directory: {root}")
    
    for d in dirs:
        print(f"  Subfolder: {os.path.join(root, d)}")
    
    for f in files:
        print(f"  File: {os.path.join(root, f)}")
