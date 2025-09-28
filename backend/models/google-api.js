const mongoose = require('mongoose');

// const DocumentModel = mongoose.model('Document'); 

async function createVectorIndex(DocumentModel, indexName) {
  try {
    // 1. Check if the index already exists
    const indexes = await DocumentModel.listIndexes();
    const indexExists = indexes.some(index => index.name === indexName);

    if (indexExists) {
      console.log(`Vector Search Index '${indexName}' already exists.`);
      return;
    }

    // 2. Define the Vector Search Index configuration
    const indexDefinition = {
      type: 'vectorSearch',
      name: indexName,
      definition: {
        fields: [
          {
            path: 'vector', // 👈 This must match the field in your schema
            numDimensions: 768, // 👈 Must match your embedding model's dimension (e.g., 768 for Gemini, 1536 for older OpenAI)
            type: 'vector',
            similarity: 'cosine', // or 'euclidean', or 'dotProduct'
          },
        ],
      },
    };

    // 3. Create the index
    console.log(`Creating Vector Search Index '${indexName}'...`);
    await DocumentModel.createSearchIndex(indexDefinition);
    
    console.log(`Index '${indexName}' creation initiated. Check MongoDB Atlas for status (it may take a few minutes to be 'Ready').`);

  } catch (error) {
    console.error('Error creating Vector Search Index:', error);
  }
}

// Example Call (replace with your actual Model and index name)
// createVectorIndex(DocumentModel, 'my_vector_index');
