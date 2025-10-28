import aiService from '../services/aiService.js';
import User from '../models/User.js';
import Application from '../models/Application.js';
import { getApplications } from './applicationController.js';




// Generate application insights
export const generateApplicationInsights = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const userId = req.user.id;

    // Get user profile
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get application data
    let applications;
    if (user.role === 'recruiter') {
      applications = await Application.find({}).populate('candidateId').lean();
    } else {
      applications = await Application.find({ candidateId: userId }).lean();
    }
    const application = applications.find(app => app._id.toString() === applicationId);
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const insights = await aiService.generateApplicationInsights(application, user);
    res.json(insights);
  } catch (error) {
    console.error('Insights Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Generate interview preparation
export const generateInterviewPrep = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const userId = req.user.id;

    // Get user profile
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get application data
    let applications;
    if (user.role === 'recruiter') {
      applications = await Application.find({}).populate('candidateId').lean();
    } else {
      applications = await Application.find({ candidateId: userId }).lean();
    }
    const application = applications.find(app => app._id.toString() === applicationId);
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const interviewPrep = await aiService.generateInterviewPrep(application, user);
    res.json(interviewPrep);
  } catch (error) {
    console.error('Interview Prep Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Generate job recommendations
export const generateJobRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user profile
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's applications for analysis
    const applications = await getApplications(userId, user.role === 'recruiter' ? null : userId);

    const recommendations = await aiService.generateJobRecommendations(user, applications);
    res.json(recommendations);
  } catch (error) {
    console.error('Recommendations Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Guest AI Chat endpoint (no authentication required)
export const guestChat = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Mock AI response for guest users - in production, this would call an LLM API
    let response = '';
    
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('what') && lowerMessage.includes('workcompass')) {
      response = 'WorkCompass is a comprehensive job tracking platform that helps both job seekers and recruiters manage applications efficiently. We offer AI-powered insights, interview preparation, and detailed analytics to optimize your job search process.';
    } else if (lowerMessage.includes('feature') || lowerMessage.includes('capability')) {
      response = 'WorkCompass offers amazing features like: 📊 Application tracking and analytics, 🤖 AI-powered insights and recommendations, 🎯 Interview preparation tools, 📅 Calendar integration, 📈 Progress visualization, and much more! Sign up to experience the full platform.';
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('free')) {
      response = 'WorkCompass offers a free tier with essential features! You can track applications, get basic insights, and use our AI assistant. Premium features include advanced analytics, unlimited applications, and priority support. Try it free today!';
    } else if (lowerMessage.includes('sign up') || lowerMessage.includes('register') || lowerMessage.includes('account')) {
      response = 'Great choice! You can sign up by clicking the "Sign Up" button in the top navigation. It only takes a minute, and you\'ll get immediate access to all our features. Once registered, I can provide personalized assistance with your job applications!';
    } else if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      response = 'I\'m here to help! You can ask me about WorkCompass features, job search tips, or career advice. For technical support, you can also use the feedback form on this page. What specific help do you need?';
    } else if (lowerMessage.includes('job') && (lowerMessage.includes('search') || lowerMessage.includes('application'))) {
      response = 'Job searching can be challenging, but WorkCompass makes it easier! Our platform helps you organize applications, track progress, prepare for interviews, and get AI-powered insights. Sign up to start managing your job search like a pro!';
    } else if (lowerMessage.includes('ai') || lowerMessage.includes('artificial intelligence')) {
      response = 'Yes! WorkCompass features advanced AI capabilities including personalized application insights, interview preparation, voice interaction, and smart recommendations. Our AI learns from your data to provide increasingly helpful career guidance.';
    } else {
      response = 'That\'s a great question! WorkCompass can help with that and much more. To get personalized assistance and access to all features, I recommend signing up for a free account. You\'ll be able to track applications, get AI insights, and I can provide much more detailed help!';
    }

    res.json({
      response,
      timestamp: new Date().toISOString(),
      context: {
        isGuest: true,
        messageCount: 1
      }
    });
  } catch (error) {
    console.error('Guest AI Chat Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// AI Chat endpoint for general assistance
export const aiChat = async (req, res) => {
  try {
    const { message, context } = req.body;
    const userId = req.user.id;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get user profile for context
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's applications for context
    let applications;
    if (user.role === 'recruiter') {
      applications = await Application.find({}).populate('candidateId').lean();
    } else {
      applications = await Application.find({ candidateId: userId }).lean();
    }

    // Mock AI response - in production, this would integrate with OpenAI or similar
    let response = '';
    
    if (message.toLowerCase().includes('application') || message.toLowerCase().includes('job')) {
      response = `I can help you with your job applications! You currently have ${applications.length} applications tracked. `;
      
      if (applications.length > 0) {
        const recentApp = applications[applications.length - 1];
        response += `Your most recent application is for ${recentApp.role} at ${recentApp.company}. `;
      }
      
      response += 'Would you like me to provide insights on any specific application or help you prepare for an upcoming interview?';
    } else if (message.toLowerCase().includes('interview')) {
      response = 'I can help you prepare for interviews! I can provide practice questions, company research tips, and interview strategies. Which application would you like interview prep for?';
    } else if (message.toLowerCase().includes('recommendation') || message.toLowerCase().includes('suggest')) {
      response = 'I can analyze your profile and application history to suggest relevant job opportunities. Let me generate some personalized recommendations for you.';
    } else {
      response = 'I\'m your AI assistant for job tracking! I can help you with application insights, interview preparation, job recommendations, and general career advice. What would you like help with?';
    }

    res.json({
      response,
      timestamp: new Date().toISOString(),
      context: {
        userId,
        userRole: user.role,
        applicationCount: applications.length
      }
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: error.message });
  }
};
