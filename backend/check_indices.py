"""Script to check OpenSearch indices details."""

import asyncio
import json
from services.opensearch_service import opensearch_service


async def check_indices_details():
    """Check detailed information about indices."""
    print("\n" + "="*60)
    print("🔍 CHECKING OPENSEARCH INDICES DETAILS")
    print("="*60)
    
    for content_type, index_name in opensearch_service.indices.items():
        print(f"\n📦 {content_type.upper()}: {index_name}")
        print("-" * 60)
        
        try:
            # Check if index exists
            exists = opensearch_service.client.indices.exists(index=index_name)
            
            if not exists:
                print("   ❌ Index does not exist")
                continue
            
            # Get index settings
            settings = opensearch_service.client.indices.get_settings(index=index_name)
            knn_enabled = settings[index_name]["settings"]["index"].get("knn", False)
            print(f"   k-NN enabled: {knn_enabled}")
            
            # Get mapping
            mapping = opensearch_service.client.indices.get_mapping(index=index_name)
            properties = mapping[index_name]["mappings"]["properties"]
            
            # Check embedding field
            if "embedding" in properties:
                embedding_config = properties["embedding"]
                print(f"   ✅ Embedding field exists")
                print(f"      Type: {embedding_config.get('type')}")
                print(f"      Dimension: {embedding_config.get('dimension')}")
                
                if "method" in embedding_config:
                    method = embedding_config["method"]
                    print(f"      Method: {method.get('name')}")
                    print(f"      Engine: {method.get('engine')}")
                    print(f"      Space: {method.get('space_type')}")
            else:
                print("   ❌ Embedding field does NOT exist")
            
            # Get document count
            count = opensearch_service.client.count(index=index_name)
            doc_count = count["count"]
            print(f"   📊 Document count: {doc_count}")
            
            # Get a sample document
            if doc_count > 0:
                search_result = opensearch_service.client.search(
                    index=index_name,
                    body={"query": {"match_all": {}}, "size": 1}
                )
                
                if search_result["hits"]["hits"]:
                    doc = search_result["hits"]["hits"][0]["_source"]
                    
                    print(f"   📄 Sample document:")
                    print(f"      ID: {doc.get('id')}")
                    print(f"      Title: {doc.get('title')}")
                    
                    # Check if embedding exists and is correct type
                    if "embedding" in doc:
                        embedding = doc["embedding"]
                        if isinstance(embedding, list):
                            print(f"      ✅ Embedding: list with {len(embedding)} dimensions")
                            print(f"         Sample: {embedding[:3]}...")
                        else:
                            print(f"      ❌ Embedding: {type(embedding)} (should be list)")
                    else:
                        print(f"      ❌ Embedding: NOT FOUND in document")
            
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    # Test a simple vector search
    print("\n" + "="*60)
    print("🧪 TESTING VECTOR SEARCH")
    print("="*60)
    
    try:
        from services.embedding_service import embedding_service
        
        # Generate a test embedding
        test_query = "Python programming"
        print(f"\nGenerating embedding for: '{test_query}'")
        test_embedding = await embedding_service.generate_embedding(test_query)
        
        if test_embedding:
            print(f"✅ Embedding generated: {len(test_embedding)} dimensions")
            
            # Try vector search on courses
            print("\nTesting vector search on 'courses' index...")
            results = await opensearch_service.vector_search(
                content_type="courses",
                query_embedding=test_embedding,
                k=5
            )
            
            if results:
                print(f"✅ Vector search returned {len(results)} results")
                for i, result in enumerate(results[:3], 1):
                    print(f"   {i}. {result['title']} (score: {result['score']:.4f})")
            else:
                print("❌ Vector search returned NO results")
        else:
            print("❌ Failed to generate embedding")
            
    except Exception as e:
        print(f"❌ Error during vector search test: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(check_indices_details())

