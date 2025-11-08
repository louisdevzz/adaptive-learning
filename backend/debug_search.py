"""Debug script to check search functionality."""

import asyncio
import sys
from sqlalchemy.orm import Session

from core.database import SessionLocal
from services.opensearch_service import opensearch_service
from services.embedding_service import embedding_service
from services.search_service import search_service
from repositories.course_repo import CourseRepository
from repositories.module_repo import ModuleRepository
from repositories.section_repo import SectionRepository
from repositories.kp_repo import KnowledgePointRepository


async def check_opensearch_connection():
    """Check if OpenSearch is reachable."""
    print("\n" + "="*60)
    print("1️⃣  CHECKING OPENSEARCH CONNECTION")
    print("="*60)
    
    try:
        health = await opensearch_service.health_check()
        
        if health.get("status") == "error":
            print("❌ OpenSearch connection FAILED!")
            print(f"   Error: {health.get('error')}")
            return False
        
        print("✅ OpenSearch is running!")
        print(f"   Status: {health.get('status')}")
        print(f"   Cluster: {health.get('cluster_name')}")
        print(f"   Nodes: {health.get('number_of_nodes')}")
        print(f"   Active shards: {health.get('active_shards')}")
        return True
        
    except Exception as e:
        print(f"❌ Error connecting to OpenSearch: {e}")
        return False


async def check_indices():
    """Check if indices exist."""
    print("\n" + "="*60)
    print("2️⃣  CHECKING OPENSEARCH INDICES")
    print("="*60)
    
    indices_exist = {}
    
    for content_type, index_name in opensearch_service.indices.items():
        try:
            exists = opensearch_service.client.indices.exists(index=index_name)
            indices_exist[content_type] = exists
            
            if exists:
                # Get document count
                count = opensearch_service.client.count(index=index_name)
                doc_count = count["count"]
                print(f"✅ {content_type:20s}: {index_name} ({doc_count} documents)")
            else:
                print(f"❌ {content_type:20s}: {index_name} (NOT FOUND)")
                
        except Exception as e:
            print(f"❌ {content_type:20s}: Error - {e}")
            indices_exist[content_type] = False
    
    return indices_exist


async def check_database_content():
    """Check if there's content in the database."""
    print("\n" + "="*60)
    print("3️⃣  CHECKING DATABASE CONTENT")
    print("="*60)
    
    db = SessionLocal()
    
    try:
        course_repo = CourseRepository(db)
        module_repo = ModuleRepository(db)
        section_repo = SectionRepository(db)
        kp_repo = KnowledgePointRepository(db)
        
        courses = course_repo.get_all(skip=0, limit=10)
        modules = module_repo.get_all(skip=0, limit=10)
        sections = section_repo.get_all(skip=0, limit=10)
        kps = kp_repo.get_all(skip=0, limit=10)
        
        print(f"📚 Courses:          {len(courses)} found")
        print(f"📦 Modules:          {len(modules)} found")
        print(f"📄 Sections:         {len(sections)} found")
        print(f"🎯 Knowledge Points: {len(kps)} found")
        
        if courses:
            print("\n📝 Sample course:")
            sample = courses[0]
            print(f"   ID: {sample.id}")
            print(f"   Title: {sample.title}")
            print(f"   Description: {sample.description[:100] if sample.description else 'N/A'}...")
        
        return len(courses) > 0 or len(modules) > 0 or len(sections) > 0 or len(kps) > 0
        
    except Exception as e:
        print(f"❌ Error checking database: {e}")
        return False
    finally:
        db.close()


async def check_embedding_service():
    """Check if embedding service is working."""
    print("\n" + "="*60)
    print("4️⃣  CHECKING EMBEDDING SERVICE")
    print("="*60)
    
    try:
        test_text = "How to declare variables in Python?"
        print(f"📝 Testing with: '{test_text}'")
        
        embedding = await embedding_service.generate_embedding(test_text)
        
        if embedding:
            print(f"✅ Embedding generated successfully!")
            print(f"   Dimension: {len(embedding)}")
            print(f"   Sample values: {embedding[:5]}...")
            return True
        else:
            print("❌ Failed to generate embedding")
            print("   Check your OPENAI_API_KEY in .env file")
            return False
            
    except ValueError as e:
        print(f"❌ Configuration error: {e}")
        print("   Make sure OPENAI_API_KEY is set in your .env file")
        return False
    except Exception as e:
        print(f"❌ Error testing embedding: {e}")
        return False


async def test_search():
    """Test a simple search."""
    print("\n" + "="*60)
    print("5️⃣  TESTING SEARCH FUNCTIONALITY")
    print("="*60)
    
    try:
        query = "How to declare variables in Python?"
        print(f"🔍 Searching for: '{query}'")
        
        results = await search_service.search(
            query=query,
            content_types=["courses", "modules", "sections", "knowledge_points"],
            k=5,
            use_hybrid=True
        )
        
        total = sum(len(items) for items in results.values())
        print(f"\n📊 Search Results: {total} total results")
        
        for content_type, items in results.items():
            if items:
                print(f"\n   {content_type}: {len(items)} results")
                for item in items[:2]:  # Show first 2 results
                    print(f"      - {item['title']} (score: {item['score']:.3f})")
        
        return total > 0
        
    except Exception as e:
        print(f"❌ Error during search: {e}")
        import traceback
        traceback.print_exc()
        return False


async def initialize_and_index():
    """Initialize indices and index sample data."""
    print("\n" + "="*60)
    print("🔧 INITIALIZING INDICES AND INDEXING DATA")
    print("="*60)
    
    try:
        # Initialize indices
        print("\n1. Creating indices...")
        results = await opensearch_service.create_all_indices()
        
        for content_type, success in results.items():
            status = "✅" if success else "❌"
            print(f"   {status} {content_type}")
        
        # Index data from database
        print("\n2. Indexing data from database...")
        db = SessionLocal()
        
        try:
            counts = await search_service.reindex_all(db)
            
            print("\n📊 Indexing Results:")
            for content_type, count in counts.items():
                print(f"   {content_type:20s}: {count} indexed")
            
            total = sum(counts.values())
            print(f"\n   TOTAL: {total} documents indexed")
            
            return total > 0
            
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ Error during initialization: {e}")
        import traceback
        traceback.print_exc()
        return False


async def main():
    """Run all diagnostic checks."""
    print("\n🔬 SEARCH DIAGNOSTIC TOOL")
    print("This tool will help identify why search is not returning results\n")
    
    # Run checks
    opensearch_ok = await check_opensearch_connection()
    
    if not opensearch_ok:
        print("\n⚠️  SOLUTION: Start OpenSearch")
        print("   cd backend/docker/opensearch")
        print("   docker-compose up -d")
        return
    
    indices = await check_indices()
    has_data = await check_database_content()
    
    if not has_data:
        print("\n⚠️  SOLUTION: Add some data to the database first")
        print("   Use the API to create courses, modules, sections, etc.")
        return
    
    # Check if indices are empty
    all_empty = all(not exists for exists in indices.values())
    
    if all_empty:
        print("\n⚠️  Indices don't exist or are empty. Initializing...")
        
        # Check embedding service first
        embedding_ok = await check_embedding_service()
        
        if not embedding_ok:
            print("\n⚠️  SOLUTION: Configure OpenAI API Key")
            print("   1. Add OPENAI_API_KEY to your .env file")
            print("   2. Get API key from: https://platform.openai.com/api-keys")
            return
        
        # Initialize and index
        indexed = await initialize_and_index()
        
        if indexed:
            print("\n✅ Indexing complete! Testing search...")
            await test_search()
        else:
            print("\n❌ Indexing failed. Check logs for details.")
    else:
        # Test embedding service
        embedding_ok = await check_embedding_service()
        
        if not embedding_ok:
            print("\n⚠️  SOLUTION: Configure OpenAI API Key")
            print("   1. Add OPENAI_API_KEY to your .env file")
            print("   2. Get API key from: https://platform.openai.com/api-keys")
            return
        
        # Test search
        await test_search()
    
    print("\n" + "="*60)
    print("✅ DIAGNOSTIC COMPLETE")
    print("="*60)


if __name__ == "__main__":
    asyncio.run(main())

