import { useState } from 'react';
import { RichTextEditor } from './RichTextEditor';
import { requireClassification } from '../middleware/accessControl';

export default function ArticleEditor() {
  const [content, setContent] = useState('');
  const [documentType, setDocumentType] = useState('ARI');
  const [objectClass, setObjectClass] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/articles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        document_type: documentType,
        object_class: objectClass
      })
    });
    // Handle response
  };

  return (
    <div className="editor-container max-w-4xl mx-auto p-6">
      <form onSubmit={handleSubmit}>
        <div className="form-section mb-4">
          <label className="block mb-2 font-bold">Document Type</label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="w-full p-2 border-2 border-black"
          >
            <option value="ARI">ARI Document</option>
            <option value="ResearchPaper">Research Paper</option>
          </select>
        </div>

        {documentType === 'ARI' && (
          <div className="form-section mb-4">
            <label className="block mb-2 font-bold">Object Class</label>
            <input
              type="text"
              value={objectClass}
              onChange={(e) => setObjectClass(e.target.value)}
              className="w-full p-2 border-2 border-black"
              placeholder="E.g., Keter, Euclid, Safe"
            />
          </div>
        )}

        <div className="editor-wrapper border-2 border-black p-4">
          <RichTextEditor content={content} onUpdate={setContent} />
        </div>

        <div className="form-actions mt-4">
          <button
            type="submit"
            className="bg-black text-white px-6 py-2 hover:bg-gray-800"
          >
            Submit for Review
          </button>
        </div>
      </form>
    </div>
  );
} 