import pytest
import json
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_file_list_requires_auth(client: AsyncClient) -> None:
    response = await client.get("/files/list")
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_file_upload_and_lifecycle(auth_client: AsyncClient) -> None:
    # 1. Upload a file with shards
    manifest_data = {
        "version": 1,
        "shards": [
            {"shard_index": 0, "hash": "dummyhash1"},
            {"shard_index": 1, "hash": "dummyhash2"}
        ]
    }
    
    upload_payload = {
        "encrypted_filename": "secure_secret.enc",
        "encrypted_metadata": "metadata_payload_123",
        "file_size": 2048,
        "integrity_hash": "integrity_hash_abc_123",
        "manifest": json.dumps(manifest_data)
    }
    
    files = [
        ("shards", ("shard_0.bin", b"shard_content_part_0_binary_data")),
        ("shards", ("shard_1.bin", b"shard_content_part_1_binary_data"))
    ]
    
    response = await auth_client.post(
        "/files/upload",
        data=upload_payload,
        files=files
    )
    assert response.status_code == 201
    res_data = response.json()
    assert "file_id" in res_data
    file_id = int(res_data["file_id"])
    
    # 2. List user files and verify the uploaded file is present
    list_response = await auth_client.get("/files/list")
    assert list_response.status_code == 200
    list_data = list_response.json()
    assert len(list_data) >= 1
    uploaded_file_listed = next((f for f in list_data if f["id"] == file_id), None)
    assert uploaded_file_listed is not None
    assert uploaded_file_listed["encrypted_filename"] == "secure_secret.enc"
    
    # 3. Retrieve manifest for the file
    manifest_response = await auth_client.get(f"/files/{file_id}/manifest")
    assert manifest_response.status_code == 200
    manifest_res_data = manifest_response.json()
    assert manifest_res_data["file_id"] == file_id
    assert "replication_mapping" in manifest_res_data
    
    # 4. Download file shards and verify they can be reconstructed
    download_response = await auth_client.get(f"/files/download/{file_id}")
    assert download_response.status_code == 200
    shards_res = download_response.json()
    assert len(shards_res) == 2
    # Verify shard 0
    assert shards_res[0]["data"] == b"shard_content_part_0_binary_data".hex()
    assert shards_res[1]["data"] == b"shard_content_part_1_binary_data".hex()
    
    # 5. Rename the file
    rename_response = await auth_client.put(
        f"/files/{file_id}",
        data={"new_filename": "renamed_secure_secret.enc"}
    )
    assert rename_response.status_code == 200
    rename_data = rename_response.json()
    assert rename_data["encrypted_filename"] == "renamed_secure_secret.enc"
    
    # 6. Delete the file
    delete_response = await auth_client.delete(f"/files/{file_id}")
    assert delete_response.status_code == 204
    
    # 7. List user files again and verify the deleted file is gone
    list_after_delete = await auth_client.get("/files/list")
    assert list_after_delete.status_code == 200
    list_after_delete_data = list_after_delete.json()
    deleted_listed = next((f for f in list_after_delete_data if f["id"] == file_id), None)
    assert deleted_listed is None
