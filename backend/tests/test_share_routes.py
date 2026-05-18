import pytest
import json
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_share_flow_requires_auth(client: AsyncClient) -> None:
    # Creating share link requires authentication
    response = await client.post("/api/share/create", json={"file_id": 9999})
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_share_creation_and_public_decryption_lifecycle(auth_client: AsyncClient, client: AsyncClient) -> None:
    # 1. Upload a mock file with shards first so we have a valid owned file
    manifest_data = {
        "version": 1,
        "shards": [
            {"shard_index": 0, "hash": "shard0hash"},
            {"shard_index": 1, "hash": "shard1hash"}
        ]
    }
    
    upload_payload = {
        "encrypted_filename": "shared_secrets.enc",
        "encrypted_metadata": "shared_metadata_xyz",
        "file_size": 1024,
        "integrity_hash": "integrity_hash_shared_xyz",
        "manifest": json.dumps(manifest_data)
    }
    
    files = [
        ("shards", ("shard_0.bin", b"mock_shared_shard_0_data")),
        ("shards", ("shard_1.bin", b"mock_shared_shard_1_data"))
    ]
    
    upload_res = await auth_client.post(
        "/files/upload",
        data=upload_payload,
        files=files
    )
    assert upload_res.status_code == 201
    file_id = int(upload_res.json()["file_id"])

    # 2. Create a secure share link for the uploaded file
    share_payload = {
        "file_id": file_id,
        "ttl_hours": 1,
        "max_downloads": 2,
        "label": "Confidential Shards"
    }
    share_create_res = await auth_client.post("/api/share/create", json=share_payload)
    assert share_create_res.status_code == 201
    share_token = share_create_res.json()["share_token"]
    assert len(share_token) > 0

    # 3. List active shares and verify presence of the new share record
    list_res = await auth_client.get("/api/share/list")
    assert list_res.status_code == 200
    list_data = list_res.json()
    assert len(list_data) >= 1
    new_share = next((s for s in list_data if s["share_token"] == share_token), None)
    assert new_share is not None
    assert new_share["label"] == "Confidential Shards"
    assert new_share["is_active"] is True

    # 4. Access the share anonymously as a public guest (no authorization header needed)
    public_res = await client.get(f"/api/share/{share_token}")
    assert public_res.status_code == 200
    public_data = public_res.json()
    assert public_data["file_id"] == file_id
    assert public_data["encrypted_filename"] == "shared_secrets.enc"
    assert "shards" in public_data
    assert len(public_data["shards"]) == 2
    assert public_data["shards"][0]["data"] == b"mock_shared_shard_0_data".hex()
    assert public_data["shards"][1]["data"] == b"mock_shared_shard_1_data".hex()

    # 5. Revoke the share link as the owner
    revoke_res = await auth_client.delete(f"/api/share/{share_token}")
    assert revoke_res.status_code == 200
    assert revoke_res.json()["status"] == "revoked"

    # 6. Verify that accessing the revoked link now returns 410 Gone
    public_revoked_res = await client.get(f"/api/share/{share_token}")
    assert public_revoked_res.status_code == 410
