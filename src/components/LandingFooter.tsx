import React from 'react'
import { Row, Col, Typography, Button, Input, Divider } from 'antd'
import { 
  MailOutlined, 
  PhoneOutlined, 
  EnvironmentOutlined,
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  YoutubeOutlined,
  GithubOutlined
} from '@ant-design/icons'

const { Title, Paragraph, Text } = Typography
const { Search } = Input

const LandingFooter: React.FC = () => {
  const footerLinks = {
    products: [
      { name: 'PC Builder', href: '/' },
      { name: 'CPU', href: '/products/cpu' },
      { name: 'GPU', href: '/products/gpu' },
      { name: 'RAM', href: '/products/ram' },
      { name: 'Storage', href: '/products/storage' },
      { name: 'Power Supply', href: '/products/psu' }
    ],
    community: [
      { name: 'Completed Builds', href: '#' },
      { name: 'Reviews', href: '#' },
      { name: 'Forums', href: '#' },
      { name: 'Discord', href: '#' },
      { name: 'Reddit', href: '#' }
    ],
    support: [
      { name: 'Help Center', href: '#' },
      { name: 'Contact Us', href: '#' },
      { name: 'FAQ', href: '#' },
      { name: 'Shipping Info', href: '#' },
      { name: 'Returns', href: '#' }
    ],
    company: [
      { name: 'About Us', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Press', href: '#' },
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' }
    ]
  }

  const socialLinks = [
    { icon: <FacebookOutlined />, href: '#', color: '#1877f2' },
    { icon: <TwitterOutlined />, href: '#', color: '#1da1f2' },
    { icon: <InstagramOutlined />, href: '#', color: '#e4405f' },
    { icon: <YoutubeOutlined />, href: '#', color: '#ff0000' },
    { icon: <GithubOutlined />, href: '#', color: '#333' }
  ]

  return (
    <footer style={{
      background: 'linear-gradient(135deg,rgb(5, 5, 25) 0%,rgb(13, 13, 19) 100%)',
      color: 'white',
      padding: '100px 0 100px',
      width: '100vw',
      marginLeft: 'calc(-50vw + 50%)',
      position: 'relative',
      left: '10%',
      right: '70%'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 24px',
        width: '100%'
      }}>
        {/* Main Footer Content */}
        <Row gutter={[48, 48]}>
          {/* Brand Section */}
          <Col xs={24} sm={12} lg={6}>
            <div style={{ marginBottom: '32px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: 'linear-gradient(45deg, #050544, #0a0a6e)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  color: 'white'
                }}>
                  E
                </div>
                <Title level={3} style={{ color: 'white', margin: 0, fontSize: '24px' }}>
                  EzBuild
                </Title>
              </div>
              <Paragraph style={{ 
                color: 'rgba(255,255,255,0.8)', 
                lineHeight: 1.6,
                marginBottom: '24px'
              }}>
                The ultimate PC building platform. Create, compare, and purchase your perfect build with confidence.
              </Paragraph>
              
              {/* Contact Info */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <MailOutlined style={{ color: '#050544' }} />
                  <Text style={{ color: 'rgba(255,255,255,0.8)' }}>support@ezbuild.com</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <PhoneOutlined style={{ color: '#050544' }} />
                  <Text style={{ color: 'rgba(255,255,255,0.8)' }}>+1 (555) 123-4567</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <EnvironmentOutlined style={{ color: '#050544' }} />
                  <Text style={{ color: 'rgba(255,255,255,0.8)' }}>San Francisco, CA</Text>
                </div>
              </div>
            </div>
          </Col>

          {/* Products */}
          <Col xs={12} sm={6} lg={3}>
            <Title level={5} style={{ color: 'white', marginBottom: '24px', fontSize: '16px' }}>
              Products
            </Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {footerLinks.products.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  style={{
                    color: 'rgba(255,255,255,0.8)',
                    textDecoration: 'none',
                    transition: 'color 0.3s ease',
                    fontSize: '14px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#050544'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </Col>

          {/* Community */}
          <Col xs={12} sm={6} lg={3}>
            <Title level={5} style={{ color: 'white', marginBottom: '24px', fontSize: '16px' }}>
              Community
            </Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {footerLinks.community.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  style={{
                    color: 'rgba(255,255,255,0.8)',
                    textDecoration: 'none',
                    transition: 'color 0.3s ease',
                    fontSize: '14px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#050544'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </Col>

          {/* Support */}
          <Col xs={12} sm={6} lg={3}>
            <Title level={5} style={{ color: 'white', marginBottom: '24px', fontSize: '16px' }}>
              Support
            </Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {footerLinks.support.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  style={{
                    color: 'rgba(255,255,255,0.8)',
                    textDecoration: 'none',
                    transition: 'color 0.3s ease',
                    fontSize: '14px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#050544'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </Col>

          {/* Company */}
          <Col xs={12} sm={6} lg={3}>
            <Title level={5} style={{ color: 'white', marginBottom: '24px', fontSize: '16px' }}>
              Company
            </Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {footerLinks.company.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  style={{
                    color: 'rgba(255,255,255,0.8)',
                    textDecoration: 'none',
                    transition: 'color 0.3s ease',
                    fontSize: '14px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#050544'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </Col>
        </Row>

        {/* Newsletter Section */}
        <Divider style={{ borderColor: 'rgba(255,255,255,0.2)', margin: '48px 0' }} />
        
        <Row gutter={[32, 32]} align="middle">
          <Col xs={24} lg={12}>
            <Title level={4} style={{ color: 'white', marginBottom: '8px' }}>
              Stay Updated
            </Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}>
              Get the latest news, tips, and exclusive deals delivered to your inbox.
            </Paragraph>
          </Col>
          <Col xs={24} lg={12}>
            <Search
              placeholder="Enter your email address"
              enterButton="Subscribe"
              size="large"
              style={{
                maxWidth: '400px'
              }}
              onSearch={(value) => console.log('Subscribe:', value)}
            />
          </Col>
        </Row>

        {/* Bottom Section */}
        <Divider style={{ borderColor: 'rgba(255,255,255,0.2)', margin: '48px 0 32px' }} />
        
        <Row gutter={[32, 32]} align="middle">
          <Col xs={24} sm={12}>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
              © 2024 EzBuild. All rights reserved. Built with ❤️ for PC enthusiasts.
            </Text>
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
              {socialLinks.map((social, index) => (
                <Button
                  key={index}
                  type="text"
                  shape="circle"
                  icon={social.icon}
                  size="large"
                  style={{
                    color: 'rgba(255,255,255,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = social.color
                    e.currentTarget.style.borderColor = social.color
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                  }}
                />
              ))}
            </div>
          </Col>
        </Row>
      </div>
    </footer>
  )
}

export default LandingFooter
