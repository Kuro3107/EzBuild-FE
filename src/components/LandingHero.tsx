import React from 'react'
import { Button, Typography, Row, Col } from 'antd'
import { PlayCircleOutlined, ArrowRightOutlined } from '@ant-design/icons'

const { Title, Paragraph } = Typography

interface LandingHeroProps {
  currentUser?: Record<string, unknown> | null
}

const LandingHero: React.FC<LandingHeroProps> = ({ currentUser }) => {
  return (
    <div style={{
      background: '#050544',
      padding: '120px 0 80px',
      position: 'relative',
      overflow: 'hidden',
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', width: '100%' }}>
        <Row gutter={[48, 48]} align="middle">
          <Col xs={24} lg={14}>
            <div style={{ color: 'white', paddingRight: '32px' }} className="hero-text-section">
              <Title 
                level={1} 
                style={{ 
                  color: 'white', 
                  fontSize: '56px', 
                  fontWeight: 700,
                  marginBottom: '24px',
                  lineHeight: 1.1,
                  marginTop: 0
                }}
              >
                Build Your Dream PC
                <br />
                <span style={{ color: '#ffd700' }}>With EzBuild</span>
              </Title>
              
              <Paragraph 
                style={{ 
                  color: 'rgba(255,255,255,0.9)', 
                  fontSize: '18px', 
                  lineHeight: 1.6,
                  marginBottom: '40px',
                  maxWidth: '520px'
                }}
              >
                Create the perfect PC build with our advanced compatibility checker, 
                real-time price comparison, and expert recommendations. 
                From gaming rigs to workstations, we've got you covered.
              </Paragraph>
              
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
                <Button 
                  type="primary" 
                  size="large"
                  style={{
                    height: '52px',
                    padding: '0 36px',
                    fontSize: '16px',
                    fontWeight: 600,
                    borderRadius: '8px',
                    background: '#050544',
                    border: '2px solid rgba(255,255,255,0.2)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  icon={<ArrowRightOutlined />}
                >
                  Start Building
                </Button>
                
                <Button 
                  size="large"
                  style={{
                    height: '52px',
                    padding: '0 36px',
                    fontSize: '16px',
                    fontWeight: 600,
                    borderRadius: '8px',
                    background: 'transparent',
                    border: '2px solid rgba(255,255,255,0.3)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  icon={<PlayCircleOutlined />}
                >
                  Watch Demo
                </Button>
              </div>
              
              {!currentUser && (
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                    Already have an account?
                  </span>
                  <Button 
                    type="link" 
                    style={{ 
                      color: '#ffd700', 
                      padding: 0,
                      fontWeight: 600,
                      textDecoration: 'underline'
                    }}
                  >
                    Sign In
                  </Button>
                </div>
              )}
            </div>
          </Col>
          
          <Col xs={24} lg={10}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '24px',
                padding: '48px 40px',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                textAlign: 'center',
                maxWidth: '400px',
                width: '100%'
              }}>
                <div style={{
                  width: '200px',
                  height: '200px',
                  background: 'linear-gradient(135deg, #4ecdc4 0%, #ff6b6b 100%)',
                  borderRadius: '50%',
                  margin: '0 auto 32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '80px',
                  color: 'white',
                  boxShadow: '0 15px 30px rgba(0,0,0,0.2)'
                }}>
                  🖥️
                </div>
                <Title level={3} style={{ 
                  color: 'white', 
                  marginBottom: '16px',
                  fontSize: '24px',
                  fontWeight: 700
                }}>
                  Interactive PC Builder
                </Title>
                <Paragraph style={{ 
                  color: 'rgba(255,255,255,0.8)', 
                  marginBottom: 0,
                  fontSize: '16px',
                  lineHeight: 1.5
                }}>
                  Drag, drop, and customize your perfect build
                </Paragraph>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default LandingHero
