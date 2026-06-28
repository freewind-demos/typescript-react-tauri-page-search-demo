import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Button, Card, Col, Input, Layout, Row, Space, Tag, Typography } from "antd";
import type { InputRef } from "antd";
import "./App.css";

const { Content, Header } = Layout;
const { Paragraph, Text, Title } = Typography;

const articleParagraphs = [
  "这个演示页模拟一篇产品设计评审文档。团队希望在桌面端快速核对需求词汇，例如 搜索、快捷键、离线、同步、权限 等关键词，因此页面需要具备稳定的页内搜索能力。",
  "传统浏览器会在 Command F 或 Control F 时打开原生查找条，但桌面应用常常希望提供自定义交互，例如把搜索结果统计、当前命中位置、上下切换按钮都放进统一的应用样式里。",
  "本页内容故意写得较长，用来验证搜索是否会穿过多个段落。比如这里讨论了知识库同步策略：客户端先读取本地缓存，再与远端服务比对版本号，最后按文档粒度增量同步，避免整包覆盖。",
  "另一段描述搜索场景：运营同学正在核对帮助中心文案，想搜索 页面、搜索框、命中、高亮、快捷键 这些词，以确认写法是否一致，避免出现查找、检索、搜索 三套不同术语。",
  "这里再补一段与工程实现相关的文字。应用监听键盘事件，在用户按下 Command F 或 Control F 时阻止默认行为，随后把焦点交给自定义输入框，并立即选中已有关键词，方便继续输入。",
  "为了让效果更明显，文档也包含一些重复词。搜索功能需要支持搜索结果计数、当前结果定位、上一条、下一条，以及当没有命中时显示明确反馈，避免用户误以为功能失效。",
  "最后一段描述后续规划：下一步可以把搜索词与系统菜单联动，或增加 ESC 关闭搜索框、Enter 跳转下一条、Shift Enter 跳转上一条 等交互。当前版本先把基础体验做稳定。 ",
];

type MatchRange = {
  end: number;
  start: number;
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getAllMatchRanges = (text: string, keyword: string): MatchRange[] => {
  if (!keyword) {
    return [];
  }

  const ranges: MatchRange[] = [];
  const pattern = new RegExp(escapeRegExp(keyword), "gi");

  for (const match of text.matchAll(pattern)) {
    const start = match.index;

    if (start === undefined) {
      continue;
    }

    ranges.push({
      start,
      end: start + match[0].length,
    });
  }

  return ranges;
};

const renderHighlightedText = (text: string, keyword: string, activeMatchIndex: number, matchOffset: number) => {
  const ranges = getAllMatchRanges(text, keyword);

  if (ranges.length === 0) {
    return text;
  }

  const nodes: Array<React.ReactNode> = [];
  let cursor = 0;

  ranges.forEach((range, index) => {
    if (cursor < range.start) {
      nodes.push(text.slice(cursor, range.start));
    }

    const isActive = matchOffset + index === activeMatchIndex;

    nodes.push(
      <mark
        className={isActive ? "search-mark search-mark-active" : "search-mark"}
        data-active={isActive}
        key={`${range.start}-${range.end}`}
      >
        {text.slice(range.start, range.end)}
      </mark>,
    );

    cursor = range.end;
  });

  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }

  return nodes;
};

const App = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [keywordDraft, setKeywordDraft] = useState("");
  const [keyword, setKeyword] = useState("");
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const searchInputRef = useRef<InputRef | null>(null);

  const matchCount = useMemo(
    () => articleParagraphs.reduce((total, paragraph) => total + getAllMatchRanges(paragraph, keyword).length, 0),
    [keyword],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "f") {
        event.preventDefault();
        setIsSearchOpen(true);

        requestAnimationFrame(() => {
          searchInputRef.current?.focus({
            cursor: "all",
          });
        });
      }

      if (event.key === "Escape") {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (matchCount === 0) {
      setActiveMatchIndex(0);
      return;
    }

    setActiveMatchIndex((current) => {
      if (current >= matchCount) {
        return 0;
      }

      return current;
    });
  }, [matchCount]);

  useEffect(() => {
    if (!keyword || matchCount === 0) {
      return;
    }

    const activeMark = document.querySelector<HTMLElement>('mark[data-active="true"]');
    activeMark?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [activeMatchIndex, keyword, matchCount]);

  const applySearch = (nextKeyword: string) => {
    setKeyword(nextKeyword.trim());
    setActiveMatchIndex(0);
  };

  const jumpToMatch = (direction: 1 | -1) => {
    if (matchCount === 0) {
      return;
    }

    setActiveMatchIndex((current) => (current + direction + matchCount) % matchCount);
  };

  let matchOffset = 0;

  return (
    <Layout className="page-layout">
      <Header className="page-header">
        <div>
          <Title className="page-title" level={3}>
            Tauri 页内搜索 Demo
          </Title>
          <Text className="page-subtitle">按 Command/Ctrl + F 打开自定义搜索框。</Text>
        </div>
        <Space>
          <Tag color="blue">Tauri</Tag>
          <Tag color="geekblue">React</Tag>
          <Tag color="purple">TypeScript</Tag>
        </Space>
      </Header>
      <Content className="page-content">
        {isSearchOpen ? (
          <Card className="search-card" size="small">
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <Row gutter={12} wrap={false}>
                <Col flex="auto">
                  <Input
                    allowClear
                    onChange={(event) => {
                      const nextKeyword = event.target.value;
                      setKeywordDraft(nextKeyword);
                      applySearch(nextKeyword);
                    }}
                    onPressEnter={() => {
                      if (keyword) {
                        jumpToMatch(1);
                      }
                    }}
                    placeholder="搜索页面文字，例如：搜索 / 快捷键 / 同步"
                    ref={searchInputRef}
                    value={keywordDraft}
                  />
                </Col>
                <Col>
                  <Space>
                    <Button onClick={() => jumpToMatch(-1)}>上一条</Button>
                    <Button onClick={() => jumpToMatch(1)}>下一条</Button>
                    <Button onClick={() => setIsSearchOpen(false)}>关闭</Button>
                    <Button onClick={() => jumpToMatch(1)} type="primary">
                      下一条
                    </Button>
                  </Space>
                </Col>
              </Row>
              <Space>
                <Text type={matchCount === 0 && keyword ? "danger" : undefined}>
                  {keyword ? `结果 ${matchCount === 0 ? "0" : `${activeMatchIndex + 1} / ${matchCount}`}` : "输入关键词后立即搜索；按 Enter 跳到下一条。"}
                </Text>
                {keyword ? <Tag>{`关键词：${keyword}`}</Tag> : null}
              </Space>
            </Space>
          </Card>
        ) : null}

        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Alert
              message="交互说明"
              description="按 Command/Ctrl + F 打开搜索框。输入时立即高亮命中；按 Enter 跳到下一条结果。"
              showIcon
              type="info"
            />
          </Col>
          <Col span={24}>
            <Card title="演示文档" bordered>
              <Space className="article-space" direction="vertical" size="middle">
                {articleParagraphs.map((paragraph, index) => {
                  const currentOffset = matchOffset;
                  matchOffset += getAllMatchRanges(paragraph, keyword).length;

                  return (
                    <Paragraph key={paragraph.slice(0, 16) + index}>
                      {renderHighlightedText(paragraph, keyword, activeMatchIndex, currentOffset)}
                    </Paragraph>
                  );
                })}
              </Space>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default App;
