import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { SessionContext } from "../SessionProvider";

export function Post(props) {
  const { currentUser } = useContext(SessionContext);
  const { post, isEditing, editedContent, setEditedContent } = props;

  // ファイルの種類を判別して適切な要素をレンダリングするヘルパー関数
  const renderMedia = (url) => {
    const lowercasedUrl = url.toLowerCase();

    if (lowercasedUrl.match(/\.(jpeg|jpg|png|gif|webp|svg)$/)) {
      return <img key={url} src={url} alt="Post image" className="max-w-full h-auto rounded-md object-cover" />;
    } else if (lowercasedUrl.match(/\.(mp4|webm|ogg)$/)) {
      return (
        <video key={url} controls className="max-w-full h-auto rounded-md">
          <source src={url} type={`video/${lowercasedUrl.split('.').pop()}`} />
          お使いのブラウザは動画タグをサポートしていません。
        </video>
      );
    } else if (lowercasedUrl.match(/\.(mp3|wav|ogg|aac)$/)) {
      return (
        <audio key={url} controls className="w-full">
          <source src={url} type={`audio/${lowercasedUrl.split('.').pop()}`} />
          お使いのブラウザは音声タグをサポートしていません。
        </audio>
      );
    } else if (lowercasedUrl.match(/\.pdf$/)) {
      return (
        <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          <span className="mr-1">📄</span>PDFファイルを表示/ダウンロード
        </a>
      );
    } else {
      const fileName = url.substring(url.lastIndexOf('/') + 1);
      return (
        <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          <span className="mr-1">🔗</span>{fileName} をダウンロード
        </a>
      );
    }
  };

  return (
    <div className="mt-4 bg-white p-4 rounded-lg shadow-md">
      {/* 投稿者名表示部分: ここは元の通りに変更なし */}
      <h3 className="text-lg font-semibold">
        by{' '}
        <Link
          to={`/profile/${post.userId}`} 
          className="text-blue-600 hover:underline"
        >
          {post.userName}
        </Link>
      </h3>
      {isEditing ? (
        <>
          <textarea
            className="w-full p-2 mb-2 border border-gray-300 rounded"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
          />
          <div className="flex space-x-4">
            <button
              onClick={props.onSave}
              className="text-green-600 hover:underline focus:outline-none"
            >
              保存
            </button>
            <button
              onClick={props.onCancel}
              className="text-gray-500 hover:underline focus:outline-none"
            >
              キャンセル
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-gray-700">{post.content}</p>

          {/* メディア表示部分 */}
          {post.mediaUrls && post.mediaUrls.length > 0 && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {post.mediaUrls.map((url) => renderMedia(url))}
            </div>
          )}

          {currentUser.id === post.userId && (
            <div className="mt-2 flex space-x-4">
              <button
                onClick={props.onEdit}
                className="text-sky-500 hover:underline focus:outline-none"
              >
                編集
              </button>
              <button
                onClick={() => props.onDelete(post.id)}
                className="text-blue-500 hover:underline focus:outline-none"
              >
                削除
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}