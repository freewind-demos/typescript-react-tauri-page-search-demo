import { Alert, Card, Col, Layout, Row, Space, Tag, Typography } from "antd";
import "./App.css";
import { PageSearch } from "./PageSearch";

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

const App = () => {
  return (
    <PageSearch>
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
          <Row gutter={[24, 24]}>
            <Col span={24}>
              <Alert
                message="交互说明"
                description="搜索组件不依赖具体文案结构，直接扫描当前页面 DOM 文本节点。"
                showIcon
                type="info"
              />
            </Col>
            <Col span={24}>
              <Card title="演示文档" bordered>
                <Space className="article-space" direction="vertical" size="middle">
                  {articleParagraphs.map((paragraph, index) => (
                    <Paragraph key={paragraph.slice(0, 16) + index}>{paragraph}</Paragraph>
                  ))}
                </Space>
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    </PageSearch>
  );
};

export default App;
