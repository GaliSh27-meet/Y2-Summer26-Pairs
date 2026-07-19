function renderInline(text: string, keyBase: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
  let lastIndex = 0;
  let match;
  let i = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    if (match[2]) nodes.push(<strong key={`${keyBase}-b-${i}`}>{match[2]}</strong>);
    else if (match[3]) nodes.push(<em key={`${keyBase}-i-${i}`}>{match[3]}</em>);
    else if (match[4]) nodes.push(<code key={`${keyBase}-c-${i}`}>{match[4]}</code>);
    lastIndex = regex.lastIndex;
    i++;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

export default function MarkdownMessage({ content }: { content: string }) {
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  let list: string[] | null = null;
  let key = 0;

  const flushList = () => {
    if (!list) return;
    blocks.push(
      <ul key={`ul-${key++}`}>
        {list.map((item, idx) => (
          <li key={`li-${key++}-${idx}`}>{renderInline(item, `li-${key}-${idx}`)}</li>
        ))}
      </ul>,
    );
    list = null;
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^#{1,6}\s+/.test(trimmed)) {
      flushList();
      const level = trimmed.match(/^(#{1,6})\s+/)![1].length;
      const text = trimmed.replace(/^#{1,6}\s+/, '');
      const Tag = (`h${Math.min(level + 2, 6)}` as keyof React.JSX.IntrinsicElements);
      blocks.push(<Tag key={`h-${key++}`}>{renderInline(text, `h-${key}`)}</Tag>);
    } else if (/^\s*[-*]\s+/.test(trimmed)) {
      if (!list) list = [];
      list.push(trimmed.replace(/^\s*[-*]\s+/, ''));
    } else if (/^\s*\d+\.\s+/.test(trimmed)) {
      flushList();
      blocks.push(
        <ol key={`ol-${key++}`}>
          <li>{renderInline(trimmed.replace(/^\s*\d+\.\s+/, ''), `ol-${key}`)}</li>
        </ol>,
      );
    } else if (trimmed === '') {
      flushList();
    } else {
      flushList();
      blocks.push(<p key={`p-${key++}`}>{renderInline(trimmed, `p-${key}`)}</p>);
    }
  }
  flushList();

  return <div className="markdown">{blocks}</div>;
}
