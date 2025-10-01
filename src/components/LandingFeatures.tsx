import React from 'react'
import { Row, Col, Card, Typography } from 'antd'
import { 
  CheckCircleOutlined,
  DollarCircleOutlined,
  ThunderboltOutlined,
  TeamOutlined,
  SafetyOutlined,
  RocketOutlined
} from '@ant-design/icons'

const { Title, Paragraph } = Typography

const LandingFeatures: React.FC = () => {
  const features = [
    {
      icon: <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a' }} />,
      title: 'Compatibility Check',
      description: 'Advanced compatibility checking ensures all components work together perfectly.',
      color: '#52c41a'
    },
    {
      icon: <DollarCircleOutlined style={{ fontSize: '48px', color: '#1890ff' }} />,
      title: 'Price Comparison',
      description: 'Compare prices from multiple retailers to get the best deals on your build.',
      color: '#1890ff'
    },
    {
      icon: <ThunderboltOutlined style={{ fontSize: '48px', color: '#faad14' }} />,
      title: 'Performance Analysis',
      description: 'Get detailed performance metrics and benchmarks for your selected components.',
      color: '#faad14'
    },
    {
      icon: <TeamOutlined style={{ fontSize: '48px', color: '#722ed1' }} />,
      title: 'Community Reviews',
      description: 'Read real reviews from our community of PC builders and enthusiasts.',
      color: '#722ed1'
    },
    {
      icon: <SafetyOutlined style={{ fontSize: '48px', color: '#f5222d' }} />,
      title: 'Build Validation',
      description: 'Our AI validates your build for optimal performance and compatibility.',
      color: '#f5222d'
    },
    {
      icon: <RocketOutlined style={{ fontSize: '48px', color: '#13c2c2' }} />,
      title: 'Quick Start Templates',
      description: 'Choose from pre-built templates for gaming, work, or creative builds.',
      color: '#13c2c2'
    }
  ]

  return (
    <div style={{ padding: '80px 0', background: '#000000' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <Title level={2} style={{ fontSize: '36px', fontWeight: 700, marginBottom: '16px', color: 'white' }}>
            Why Choose EzBuild?
          </Title>
          <Paragraph style={{ fontSize: '18px', color: 'rgba(255,255,255,0.8)', maxWidth: '600px', margin: '0 auto' }}>
            We provide everything you need to build the perfect PC, from planning to purchasing.
          </Paragraph>
        </div>
        
        <Row gutter={[32, 32]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} lg={8} key={index}>
              <Card
                hoverable
                style={{
                  height: '100%',
                  borderRadius: '16px',
                  border: '1px solid #333333',
                  background: '#111111',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  transition: 'all 0.3s ease'
                }}
                bodyStyle={{
                  padding: '32px 24px',
                  textAlign: 'center',
                  background: '#111111'
                }}
              >
                <div style={{ marginBottom: '24px' }}>
                  {feature.icon}
                </div>
                <Title level={4} style={{ marginBottom: '16px', fontSize: '20px', color: 'white' }}>
                  {feature.title}
                </Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.6 }}>
                  {feature.description}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  )
}

export default LandingFeatures
