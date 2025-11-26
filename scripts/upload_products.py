import os
import sys
import mimetypes
from supabase import create_client, Client

# ==========================================
# CONFIGURATION
# ==========================================
# 1. Add your Supabase URL and Service Role Key (or Anon Key if RLS allows)
#    It is best practice to use environment variables, but for this script you can paste them here
#    OR create a .env file in this directory.
SUPABASE_URL = "https://ktreytfeiitijxvijhlf.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0cmV5dGZlaWl0aWp4dmlqaGxmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk0ODk3MCwiZXhwIjoyMDc4NTI0OTcwfQ.bg2q5E-9PY0wkQ33rmA1V5vWc9YtHCwIUjkPUlb6LyE" 

# 2. Name of your Storage Bucket in Supabase
BUCKET_NAME = "products"

# 3. Directory containing your photos
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SOURCE_DIR = r"D:\Fear_Insight\Fear_Insight\whb"

# ==========================================

def upload_files():
    if SUPABASE_URL == "YOUR_SUPABASE_URL" or SUPABASE_KEY == "YOUR_SUPABASE_SERVICE_ROLE_KEY":
        print("Error: Please set your SUPABASE_URL and SUPABASE_KEY in the script.")
        return

    # Initialize Supabase Client
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Ensure source directory exists
    if not os.path.exists(SOURCE_DIR):
        os.makedirs(SOURCE_DIR)
        print(f"Created directory '{SOURCE_DIR}'. Please put your photos in there and run the script again.")
        return

    files = [f for f in os.listdir(SOURCE_DIR) if os.path.isfile(os.path.join(SOURCE_DIR, f))]
    
    if not files:
        print(f"No files found in '{SOURCE_DIR}'.")
        return

    print(f"Found {len(files)} files to upload...")
    
    uploaded_urls = {}

    for filename in files:
        file_path = os.path.join(SOURCE_DIR, filename)
        
        # Optional: Rename logic here if needed
        # new_filename = clean_filename(filename)
        # file_path = rename_file(file_path, new_filename)
        
        # Read file content
        with open(file_path, 'rb') as f:
            file_content = f.read()
        
        # Detect content type
        content_type, _ = mimetypes.guess_type(filename)
        if not content_type:
            content_type = "application/octet-stream"

        # Upload to Supabase Storage
        # We use the filename as the path in the bucket
        storage_path = f"{filename}"
        
        print(f"Uploading '{filename}'...")
        
        try:
            # Try to upload with upsert to handle existing files
            res = supabase.storage.from_(BUCKET_NAME).upload(
                path=storage_path,
                file=file_content,
                file_options={
                    "content-type": content_type,
                    "upsert": "true"  # Overwrite if file exists
                }
            )
            
            # Get Public URL
            public_url = supabase.storage.from_(BUCKET_NAME).get_public_url(storage_path)
            
            uploaded_urls[filename] = public_url
            print(f"  -> Success: {public_url}")
            
        except Exception as e:
            print(f"  -> Error uploading {filename}: {e}")

    # Output Results
    print("\n" + "="*30)
    print("UPLOAD COMPLETE")
    print("="*30)
    print("Here are your URLs (Copy and Paste these):")
    for fname, url in uploaded_urls.items():
        print(f"{fname}: {url}")

    # Optional: Save to a file
    output_file = os.path.join(SCRIPT_DIR, "uploaded_urls.txt")
    with open(output_file, "w") as f:
        for fname, url in uploaded_urls.items():
            f.write(f"{fname}: {url}\n")
    print(f"\nSaved list to '{output_file}'")

if __name__ == "__main__":
    upload_files()
