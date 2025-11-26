import os
from supabase import create_client, Client

# Configuration
SUPABASE_URL = "https://ktreytfeiitijxvijhlf.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0cmV5dGZlaWl0aWp4dmlqaGxmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk0ODk3MCwiZXhwIjoyMDc4NTI0OTcwfQ.bg2q5E-9PY0wkQ33rmA1V5vWc9YtHCwIUjkPUlb6LyE"
BUCKET_NAME = "products"

def create_bucket():
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    try:
        # Create the bucket with public access
        result = supabase.storage.create_bucket(
            BUCKET_NAME,
            options={"public": True}
        )
        print(f"✓ Successfully created bucket '{BUCKET_NAME}'")
        print(f"  Bucket is set to PUBLIC - all uploaded files will be publicly accessible")
        return True
    except Exception as e:
        error_msg = str(e)
        if "already exists" in error_msg.lower():
            print(f"✓ Bucket '{BUCKET_NAME}' already exists")
            return True
        else:
            print(f"✗ Error creating bucket: {e}")
            return False

if __name__ == "__main__":
    print("Creating Supabase Storage Bucket...")
    print("=" * 50)
    success = create_bucket()
    print("=" * 50)
    
    if success:
        print("\nYou can now run the upload script:")
        print("  py scripts\\upload_products.py")
    else:
        print("\nPlease create the bucket manually in Supabase Dashboard:")
        print(f"  1. Go to: {SUPABASE_URL}/project/_/storage/buckets")
        print(f"  2. Click 'New bucket'")
        print(f"  3. Name it: {BUCKET_NAME}")
        print(f"  4. Make it PUBLIC")
