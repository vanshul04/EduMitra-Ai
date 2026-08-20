import os
from google import genai
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is not set in environment variables")
if not SUPABASE_URL:
    raise ValueError("SUPABASE_URL is not set in environment variables")
if not SUPABASE_SERVICE_KEY:
    raise ValueError("SUPABASE_SERVICE_KEY is not set in environment variables")

# Initialize Gemini Client
client = genai.Client(api_key=GEMINI_API_KEY)

# Initialize OpenRouter Client (as fallback for 429 errors)
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
# List of reliable free models on OpenRouter for rotation if 429 occurs
FALLBACK_MODELS = [
    os.getenv("OPENROUTER_MODEL_ID", "openai/gpt-oss-120b:free"),
    "meta-llama/llama-3.3-70b-instruct:free",
    "google/gemma-3-4b-it:free",
]
openrouter_client = None

if OPENROUTER_API_KEY:
    try:
        from openai import OpenAI
        openrouter_client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=OPENROUTER_API_KEY,
        )
    except ImportError:
        print("[!] Warning: 'openai' package not installed. OpenRouter fallback will be disabled.")
    except Exception as e:
        print(f"[!] Warning: Failed to initialize OpenRouter client: {e}")
else:
    print("[!] Info: OPENROUTER_API_KEY not found. Fallback to Llama is disabled.")

# Initialize Supabase client
supabase: Client = None
try:
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
except Exception as e:
    print(f"\n[!] WARNING: Failed to initialize Supabase client: {e}")
    print("[!] Ensure SUPABASE_URL and SUPABASE_SERVICE_KEY are correct in your .env file.")
    print("[!] Some features (database, RAG) will not work until this is fixed.\n")

# Gemini configuration
GEMINI_MODEL_ID = os.getenv("GEMINI_MODEL_ID", "gemini-3.6-flash")

# Embeddings for RAG
EMBEDDING_MODEL = os.getenv(
    "EMBEDDING_MODEL",
    "models/gemini-embedding-001"
)

# Must match your Supabase vector(768) column
EMBEDDING_DIMENSIONS = 768