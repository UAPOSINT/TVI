import { useRouter } from 'next/router';
import { RichTextEditor } from './RichTextEditor';

export default function ArticlePage() {
  const router = useRouter();
  const { id } = router.query;
  const [article, setArticle] = useState(null);
  const [flags, setFlags] = useState([]);

  useEffect(() => {
    const loadArticle = async () => {
      const response = await fetch(`/api/articles/${id}`);
      const data = await response.json();
      setArticle(data);
      setFlags(data.flags);
    };
    loadArticle();
  }, [id]);

  return (
    <div className="wiki-container max-w-4xl mx-auto p-6 bg-white shadow-lg">
      <div className="article-header border-b-2 border-black mb-6">
        <h1 className="text-4xl font-scp font-bold mb-2">
          {article?.document_type}-{article?.article_id.slice(0,4).toUpperCase()}
        </h1>
        <div className="object-class-badge bg-gray-100 p-2 inline-block">
          <strong>Object Class:</strong> {article?.object_class}
        </div>
      </div>

      <div className="content-container grid md:grid-cols-4 gap-8">
        <aside className="metadata-panel md:col-span-1 bg-gray-50 p-4">
          <div className="status-indicator mb-4">
            <span className={`status-${article?.status.toLowerCase()} badge`}>
              {article?.status}
            </span>
          </div>
          <dl className="article-meta">
            <dt>Author:</dt>
            <dd>{article?.author.username}</dd>
            <dt>Classification:</dt>
            <dd>Level {article?.author.classification_level}</dd>
          </dl>
        </aside>

        <main className="article-content md:col-span-3" 
              dangerouslySetInnerHTML={{ __html: article?.content_html }} />
      </div>

      {article?.document_type === 'ARI' && (
        <div className="containment-procedures bg-red-50 p-4 mt-6">
          <h2 className="text-2xl font-scp mb-3">Special Containment Procedures</h2>
          <div className="procedures-content">
            {article?.containment_procedures}
          </div>
        </div>
      )}
    </div>
  );
} 