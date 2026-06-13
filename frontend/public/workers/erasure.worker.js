self.onmessage = async ({ data: { fileBuffer } }) => {
  try {
    const bytes = new Uint8Array(fileBuffer);
    const CHUNK = 10 * 1024 * 1024; // 10MB
    const count = Math.ceil(bytes.length / CHUNK);
    const shards = [];

    for (let i = 0; i < count; i++) {
      shards.push(bytes.slice(i * CHUNK, (i + 1) * CHUNK).buffer);
    }

    self.postMessage(
      { type: 'complete', shards },
      shards 
    );
  } catch (e) {
    self.postMessage({ type: 'error', message: e.message });
  }
};