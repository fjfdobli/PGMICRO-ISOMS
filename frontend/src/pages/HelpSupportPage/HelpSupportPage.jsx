import React, { useState } from 'react'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import { HelpCircle, Search, MessageCircle, Mail, Phone, FileText, ChevronDown, ChevronUp, ExternalLink, BookOpen, Video, Download } from 'lucide-react'

export default function HelpSupportPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFaq, setExpandedFaq] = useState(null)
  const [activeTab, setActiveTab] = useState('faq')

  const faqData = [
    {
      id: 1,
      question: "How do I add a new product to inventory?",
      answer: "To add a new product, navigate to the Inventory page, click the 'Add Product' button, fill in the product details including name, SKU, price, and stock quantity, then click 'Save Product'."
    },
    {
      id: 2,
      question: "How can I create a new sales order?",
      answer: "Go to the Sales page, click 'New Order', select the customer, add products to the order, set quantities and prices, then click 'Create Order' to finalize the transaction."
    },
    {
      id: 3,
      question: "How do I manage user permissions?",
      answer: "Administrators can manage user permissions by going to the Users page, selecting a user, and modifying their role and access levels in the user settings."
    },
    {
      id: 4,
      question: "How can I generate reports?",
      answer: "Reports can be generated from the Dashboard or individual pages. Click the 'Generate Report' button, select the report type, date range, and format, then download the report."
    },
    {
      id: 5,
      question: "What should I do if I forget my password?",
      answer: "Click 'Forgot Password' on the login page, enter your email address, and follow the instructions in the password reset email sent to you."
    },
    {
      id: 6,
      question: "How do I update my profile information?",
      answer: "Click on your profile icon in the top-right corner, select 'Profile Settings', make your changes, and click 'Save Changes' to update your information."
    }
  ]

  const supportTickets = [
    {
      id: 'TICKET-001',
      subject: 'Unable to access inventory module',
      status: 'Open',
      priority: 'High',
      created: '2024-01-15',
      lastUpdate: '2024-01-15'
    },
    {
      id: 'TICKET-002',
      subject: 'Report generation is slow',
      status: 'In Progress',
      priority: 'Medium',
      created: '2024-01-14',
      lastUpdate: '2024-01-16'
    },
    {
      id: 'TICKET-003',
      subject: 'User permission issue',
      status: 'Resolved',
      priority: 'Low',
      created: '2024-01-10',
      lastUpdate: '2024-01-12'
    }
  ]

  const resources = [
    {
      title: 'User Manual',
      description: 'Complete guide to using the ERP system',
      type: 'PDF',
      icon: FileText,
      size: '2.4 MB',
      url: '#'
    },
    {
      title: 'Video Tutorials',
      description: 'Step-by-step video guides',
      type: 'Video',
      icon: Video,
      size: '15 videos',
      url: '#'
    },
    {
      title: 'API Documentation',
      description: 'Technical documentation for developers',
      type: 'Web',
      icon: BookOpen,
      size: 'Online',
      url: '#'
    },
    {
      title: 'System Requirements',
      description: 'Hardware and software requirements',
      type: 'PDF',
      icon: Download,
      size: '1.2 MB',
      url: '#'
    }
  ]

  const filteredFaq = faqData.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-red-100 text-red-800'
      case 'In Progress': return 'bg-yellow-100 text-yellow-800'
      case 'Resolved': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 fade-in">
          <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
          <p className="mt-2 text-gray-600">Find answers, get help, and access resources</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search for help articles, FAQs, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 fade-in" style={{ animationDelay: '0.2s' }}>
          <Card hover className="text-center">
            <MessageCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Chat</h3>
            <p className="text-gray-600 mb-4">Get instant help from our support team</p>
            <Button variant="primary" size="sm">Start Chat</Button>
          </Card>

          <Card hover className="text-center">
            <Mail className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Support</h3>
            <p className="text-gray-600 mb-4">Send us a detailed message</p>
            <Button variant="outline" size="sm">Send Email</Button>
          </Card>

          <Card hover className="text-center">
            <Phone className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone Support</h3>
            <p className="text-gray-600 mb-4">Call us for urgent issues</p>
            <Button variant="outline" size="sm">Call Now</Button>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex space-x-1 mb-6">
              {[
                { id: 'faq', label: 'FAQ', count: faqData.length },
                { id: 'tickets', label: 'My Tickets', count: supportTickets.length },
                { id: 'resources', label: 'Resources', count: resources.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {/* FAQ Tab */}
            {activeTab === 'faq' && (
              <div className="space-y-4 transition-all duration-200">
                {filteredFaq.length === 0 ? (
                  <Card>
                    <div className="text-center py-8">
                      <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                      <p className="text-gray-600">Try adjusting your search terms</p>
                    </div>
                  </Card>
                ) : (
                  filteredFaq.map((faq) => (
                    <Card key={faq.id} hover>
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                        className="w-full text-left"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                          {expandedFaq === faq.id ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </button>
                      {expandedFaq === faq.id && (
                        <div className="mt-4 pt-4 border-t border-gray-200 animate-fadeIn">
                          <p className="text-gray-600">{faq.answer}</p>
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Tickets Tab */}
            {activeTab === 'tickets' && (
              <div className="transition-all duration-200">
                <Card
                  title="Support Tickets"
                  actions={
                    <Button variant="primary" size="sm">
                      New Ticket
                    </Button>
                  }
                >
                  <div className="space-y-4">
                    {supportTickets.map((ticket) => (
                      <div key={ticket.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="text-sm font-medium text-gray-900">{ticket.subject}</h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                              {ticket.status}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">#{ticket.id} • Created {ticket.created}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-200">
                {resources.map((resource, index) => {
                  const Icon = resource.icon
                  return (
                    <Card key={index} hover className="cursor-pointer">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <Icon className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 mb-1">{resource.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">{resource.type} • {resource.size}</span>
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card title="Contact Information" className="mb-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">support@pgmicro.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone</p>
                    <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Live Chat</p>
                    <p className="text-sm text-gray-600">Available 24/7</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Quick Links">
              <div className="space-y-2">
                <a href="#" className="block text-sm text-blue-600 hover:text-blue-800 py-2">
                  Getting Started Guide
                </a>
                <a href="#" className="block text-sm text-blue-600 hover:text-blue-800 py-2">
                  Video Tutorials
                </a>
                <a href="#" className="block text-sm text-blue-600 hover:text-blue-800 py-2">
                  System Status
                </a>
                <a href="#" className="block text-sm text-blue-600 hover:text-blue-800 py-2">
                  Release Notes
                </a>
                <a href="#" className="block text-sm text-blue-600 hover:text-blue-800 py-2">
                  Community Forum
                </a>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
