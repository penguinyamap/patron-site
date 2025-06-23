import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { SessionContext } from "../SessionProvider";

export function Post(props) {
  const { currentUser } = useContext(SessionContext);
  const { post, isEditing, editedContent, setEditedContent } = props;

  // ファイルの種類を判別して適切な要素をレンダリングする関数
  const renderMedia = (file) => {
    const lowercasedUrl = file.url.toLowerCase();

    if (lowercasedUrl.match(/\.(jpeg|jpg|png|gif|webp|svg)$/)) {
      return (
        <div key={file.url}>
          <img
            src={file.url}
            alt={file.fileName}
            className="max-w-full h-auto rounded-md object-cover"
          />
          <p className="text-sm text-gray-600 mt-1">{file.fileName}</p>
        </div>
      );
    } else if (lowercasedUrl.match(/\.(mp4|webm|ogg)$/)) {
      return (
        <div key={file.url}>
          <video controls className="max-w-full h-auto rounded-md">
            <source src={file.url} type={file.type} />
            お使いのブラウザは動画タグをサポートしていません。
          </video>
          <p className="text-sm text-gray-600 mt-1">{file.fileName}</p>
        </div>
      );
    } else if (lowercasedUrl.match(/\.(mp3|wav|ogg|aac)$/)) {
      return (
        <div key={file.url}>
          <audio controls className="w-full">
            <source src={file.url} type={file.type} />
            お使いのブラウザは音声タグをサポートしていません。
          </audio>
          <p className="text-sm text-gray-600 mt-1">{file.fileName}</p>
        </div>
      );
    } else if (lowercasedUrl.match(/\.pdf$/)) {
      return (
        <div key={file.url}>
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            <span className="mr-1">📄</span>{file.fileName}
          </a>
        </div>
      );
    } else {
      return (
        <div key={file.url}>
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            <span className="mr-1">🔗</span>{file.fileName || 'ファイルをダウンロード'}
          </a>
        </div>
      );
    }
  };

  return (
    <div className="mt-4 bg-white p-4 rounded-lg shadow-md">
      {/* 投稿者名 */}
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

          {/* メディア表示（画像・動画・ファイル） */}
          {post.media && post.media.length > 0 && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {post.media.map((file) => renderMedia(file))}
            </div>
          )}

          {/* 投稿者による編集・削除ボタン */}
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
