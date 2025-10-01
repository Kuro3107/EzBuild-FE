import React, { useEffect, useState } from 'react'
import { Row, Col, Statistic, Typography } from 'antd'
import CountUp from 'react-countup'

const { Title } = Typography

const LandingStats: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const stats = [
    {
      value: 125000,
      suffix: '+',
      title: 'PCs Built',
      description: 'Successfully completed builds'
    },
    {
      value: 50000,
      suffix: '+',
      title: 'Happy Users',
      description: 'Satisfied customers worldwide'
    },
    {
      value: 99.9,
      suffix: '%',
      title: 'Compatibility Rate',
      description: 'Builds without issues'
    },
    {
      value: 24,
      suffix: '/7',
      title: 'Support',
      description: 'Round-the-clock assistance'
    }
  ]

  return (
    <div style={{ 
      padding: '80px 0',
      background: 'linear-gradient(135deg, #050544 0%, #0a0a6e 100%)',
      color: 'white'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <Title level={2} style={{ color: 'white', fontSize: '36px', fontWeight: 700, marginBottom: '16px' }}>
            Trusted by Builders Worldwide
          </Title>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px', margin: 0 }}>
            Join thousands of successful PC builders who trust EzBuild
          </p>
        </div>
        
        <Row gutter={[48, 48]}>
          {stats.map((stat, index) => (
            <Col xs={12} sm={6} key={index} style={{ textAlign: 'center' }}>
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '32px 24px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <Statistic
                  value={isVisible ? stat.value : 0}
                  suffix={stat.suffix}
                  valueStyle={{
                    color: 'white',
                    fontSize: '48px',
                    fontWeight: 700,
                    lineHeight: 1
                  }}
                  formatter={(value) => (
                    <CountUp
                      end={Number(value)}
                      duration={2}
                      separator=","
                      decimals={stat.value < 100 ? 1 : 0}
                    />
                  )}
                />
                <Title level={4} style={{ 
                  color: 'white', 
                  marginTop: '16px', 
                  marginBottom: '8px',
                  fontSize: '18px',
                  fontWeight: 600
                }}>
                  {stat.title}
                </Title>
                <p style={{ 
                  color: 'rgba(255,255,255,0.8)', 
                  margin: 0, 
                  fontSize: '14px' 
                }}>
                  {stat.description}
                </p>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  )
}

export default LandingStats
