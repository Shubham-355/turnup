const { GoogleGenerativeAI } = require('@google/generative-ai');
const planService = require('./plan.service');
const activityService = require('./activity.service');
const locationService = require('./location.service');
const expenseService = require('./expense.service');
const invitationService = require('./invitation.service');
const mediaService = require('./media.service');
const notificationService = require('./notification.service');
const ApiError = require('../utils/ApiError');

class AIAgentService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.conversationHistories = new Map();
  }

  /**
   * Define all available tools/functions the AI agent can use
   */
  getAvailableTools() {
    return [
      {
        name: 'createPlan',
        description: 'Creates a new plan (trip, nightout, picnic, etc.). Use this when user wants to create any kind of event or gathering.',
        parameters: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the plan/event',
            },
            description: {
              type: 'string',
              description: 'Description of the plan',
            },
            category: {
              type: 'string',
              enum: ['TRIP', 'NIGHTOUT'],
              description: 'Category of the plan. Use TRIP for trips, picnics, outings. Use NIGHTOUT for nightouts, parties.',
            },
            type: {
              type: 'string',
              enum: ['PRIVATE', 'PUBLIC'],
              description: 'Privacy type. PRIVATE for invite-only, PUBLIC for discoverable plans.',
            },
            startDate: {
              type: 'string',
              description: 'Start date in ISO format (YYYY-MM-DD)',
            },
            endDate: {
              type: 'string',
              description: 'End date in ISO format (YYYY-MM-DD)',
            },
          },
          required: ['name', 'category'],
        },
      },
      {
        name: 'listUserPlans',
        description: 'Get all plans for the current user. Use this to show user their existing plans.',
        parameters: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
              description: 'Filter by plan status',
            },
            category: {
              type: 'string',
              enum: ['TRIP', 'NIGHTOUT'],
              description: 'Filter by category',
            },
          },
        },
      },
      {
        name: 'getPlanDetails',
        description: 'Get detailed information about a specific plan including members, activities, expenses.',
        parameters: {
          type: 'object',
          properties: {
            planId: {
              type: 'string',
              description: 'ID of the plan to get details for',
            },
          },
          required: ['planId'],
        },
      },
      {
        name: 'updatePlan',
        description: 'Update an existing plan details like name, description, dates, status.',
        parameters: {
          type: 'object',
          properties: {
            planId: {
              type: 'string',
              description: 'ID of the plan to update',
            },
            name: {
              type: 'string',
              description: 'New name for the plan',
            },
            description: {
              type: 'string',
              description: 'New description',
            },
            status: {
              type: 'string',
              enum: ['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
              description: 'New status',
            },
            startDate: {
              type: 'string',
              description: 'New start date in ISO format',
            },
            endDate: {
              type: 'string',
              description: 'New end date in ISO format',
            },
          },
          required: ['planId'],
        },
      },
      {
        name: 'deletePlan',
        description: 'Delete a plan. Only the owner can delete a plan.',
        parameters: {
          type: 'object',
          properties: {
            planId: {
              type: 'string',
              description: 'ID of the plan to delete',
            },
          },
          required: ['planId'],
        },
      },
      {
        name: 'addActivity',
        description: 'Add an activity to a plan. Activities can be anything like dinner, hiking, visit museum, etc.',
        parameters: {
          type: 'object',
          properties: {
            planId: {
              type: 'string',
              description: 'ID of the plan to add activity to',
            },
            name: {
              type: 'string',
              description: 'Name of the activity',
            },
            description: {
              type: 'string',
              description: 'Description of the activity',
            },
            date: {
              type: 'string',
              description: 'Date of the activity in ISO format',
            },
            time: {
              type: 'string',
              description: 'Time of the activity (e.g., "14:30")',
            },
            location: {
              type: 'string',
              description: 'Location/venue of the activity',
            },
          },
          required: ['planId', 'name'],
        },
      },
      {
        name: 'listActivities',
        description: 'Get all activities for a plan.',
        parameters: {
          type: 'object',
          properties: {
            planId: {
              type: 'string',
              description: 'ID of the plan',
            },
          },
          required: ['planId'],
        },
      },
      {
        name: 'updateActivity',
        description: 'Update an existing activity details.',
        parameters: {
          type: 'object',
          properties: {
            activityId: {
              type: 'string',
              description: 'ID of the activity to update',
            },
            name: {
              type: 'string',
              description: 'New name',
            },
            description: {
              type: 'string',
              description: 'New description',
            },
            date: {
              type: 'string',
              description: 'New date in ISO format',
            },
            time: {
              type: 'string',
              description: 'New time',
            },
            location: {
              type: 'string',
              description: 'New location',
            },
          },
          required: ['activityId'],
        },
      },
      {
        name: 'deleteActivity',
        description: 'Delete an activity from a plan.',
        parameters: {
          type: 'object',
          properties: {
            activityId: {
              type: 'string',
              description: 'ID of the activity to delete',
            },
          },
          required: ['activityId'],
        },
      },
      {
        name: 'addExpense',
        description: 'Add an expense to a plan and optionally split it among members.',
        parameters: {
          type: 'object',
          properties: {
            planId: {
              type: 'string',
              description: 'ID of the plan',
            },
            description: {
              type: 'string',
              description: 'What the expense is for',
            },
            amount: {
              type: 'number',
              description: 'Amount of the expense',
            },
            category: {
              type: 'string',
              description: 'Category like FOOD, TRANSPORT, ACCOMMODATION, ENTERTAINMENT, OTHER',
            },
            splitType: {
              type: 'string',
              enum: ['EQUAL', 'MANUAL', 'PERCENTAGE'],
              description: 'How to split the expense. EQUAL splits equally among all members.',
            },
          },
          required: ['planId', 'description', 'amount'],
        },
      },
      {
        name: 'listExpenses',
        description: 'Get all expenses for a plan.',
        parameters: {
          type: 'object',
          properties: {
            planId: {
              type: 'string',
              description: 'ID of the plan',
            },
          },
          required: ['planId'],
        },
      },
      {
        name: 'inviteMemberByEmail',
        description: 'Invite someone to a plan by their email address.',
        parameters: {
          type: 'object',
          properties: {
            planId: {
              type: 'string',
              description: 'ID of the plan',
            },
            email: {
              type: 'string',
              description: 'Email address of the person to invite',
            },
          },
          required: ['planId', 'email'],
        },
      },
      {
        name: 'listPlanMembers',
        description: 'Get all members of a plan.',
        parameters: {
          type: 'object',
          properties: {
            planId: {
              type: 'string',
              description: 'ID of the plan',
            },
          },
          required: ['planId'],
        },
      },
      {
        name: 'removeMember',
        description: 'Remove a member from a plan. Only admins and owner can do this.',
        parameters: {
          type: 'object',
          properties: {
            planId: {
              type: 'string',
              description: 'ID of the plan',
            },
            memberId: {
              type: 'string',
              description: 'ID of the member to remove',
            },
          },
          required: ['planId', 'memberId'],
        },
      },
      {
        name: 'updateMemberLocation',
        description: 'Update the current location of a user for a specific plan (for location sharing).',
        parameters: {
          type: 'object',
          properties: {
            planId: {
              type: 'string',
              description: 'ID of the plan',
            },
            latitude: {
              type: 'number',
              description: 'Latitude coordinate',
            },
            longitude: {
              type: 'number',
              description: 'Longitude coordinate',
            },
          },
          required: ['planId', 'latitude', 'longitude'],
        },
      },
      {
        name: 'getMemberLocations',
        description: 'Get current locations of all members in a plan.',
        parameters: {
          type: 'object',
          properties: {
            planId: {
              type: 'string',
              description: 'ID of the plan',
            },
          },
          required: ['planId'],
        },
      },
      {
        name: 'getDirections',
        description: 'Get directions and route between two locations using Google Maps. Returns distance, duration, and turn-by-turn directions.',
        parameters: {
          type: 'object',
          properties: {
            origin: {
              type: 'string',
              description: 'Starting location (address, place name, or "lat,lng")',
            },
            destination: {
              type: 'string',
              description: 'Destination location (address, place name, or "lat,lng")',
            },
            mode: {
              type: 'string',
              enum: ['driving', 'walking', 'bicycling', 'transit'],
              description: 'Travel mode. Default is driving.',
            },
          },
          required: ['origin', 'destination'],
        },
      },
      {
        name: 'searchPlaces',
        description: 'Search for places like restaurants, hotels, attractions using Google Maps Places API.',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query (e.g., "restaurants near me", "hotels in Paris")',
            },
            location: {
              type: 'string',
              description: 'Optional location to search near (e.g., "Paris, France" or "lat,lng")',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'sendNotification',
        description: 'Send a notification to plan members.',
        parameters: {
          type: 'object',
          properties: {
            planId: {
              type: 'string',
              description: 'ID of the plan',
            },
            title: {
              type: 'string',
              description: 'Notification title',
            },
            message: {
              type: 'string',
              description: 'Notification message',
            },
          },
          required: ['planId', 'title', 'message'],
        },
      },
    ];
  }

  /**
   * Execute a tool function
   */
  async executeTool(toolName, parameters, userId) {
    try {
      switch (toolName) {
        case 'createPlan':
          return await planService.createPlan(userId, parameters);

        case 'listUserPlans':
          return await planService.getUserPlans(userId, {
            status: parameters.status,
            category: parameters.category,
            page: 1,
            limit: 20,
          });

        case 'getPlanDetails':
          return await planService.getPlanById(parameters.planId, userId);

        case 'updatePlan':
          const { planId: updatePlanId, ...updateData } = parameters;
          return await planService.updatePlan(updatePlanId, userId, updateData);

        case 'deletePlan':
          return await planService.deletePlan(parameters.planId, userId);

        case 'addActivity':
          const { planId: activityPlanId, ...activityData } = parameters;
          return await activityService.createActivity(activityPlanId, userId, activityData);

        case 'listActivities':
          return await activityService.getPlanActivities(parameters.planId, userId);

        case 'updateActivity':
          const { activityId: updateActivityId, ...updateActivityData } = parameters;
          return await activityService.updateActivity(updateActivityId, userId, updateActivityData);

        case 'deleteActivity':
          return await activityService.deleteActivity(parameters.activityId, userId);

        case 'addExpense':
          const { planId: expensePlanId, ...expenseData } = parameters;
          return await expenseService.createExpense(expensePlanId, userId, expenseData);

        case 'listExpenses':
          return await expenseService.getPlanExpenses(parameters.planId, userId);

        case 'inviteMemberByEmail':
          return await invitationService.createInvitationByEmail(
            parameters.planId,
            userId,
            parameters.email
          );

        case 'listPlanMembers':
          const planMembers = await planService.getPlanMembers(parameters.planId);
          // Verify user has access to this plan
          const planAccess = await planService.getPlanById(parameters.planId, userId);
          return planMembers;

        case 'removeMember':
          return await planService.removeMember(parameters.planId, parameters.memberId, userId);

        case 'updateMemberLocation':
          const { planId: locationPlanId, ...locationData } = parameters;
          return await locationService.updateUserLocation(locationPlanId, userId, locationData);

        case 'getMemberLocations':
          return await locationService.getPlanMemberLocations(parameters.planId, userId);

        case 'getDirections':
          return await this.getGoogleMapsDirections(
            parameters.origin,
            parameters.destination,
            parameters.mode || 'driving'
          );

        case 'searchPlaces':
          return await this.searchGooglePlaces(
            parameters.query,
            parameters.location
          );

        case 'sendNotification':
          const { planId: notifyPlanId, title, message } = parameters;
          // Get plan to verify access and get members
          const notifyPlan = await planService.getPlanById(notifyPlanId, userId);
          // Create notification for all plan members
          const notificationMembers = await planService.getPlanMembers(notifyPlanId);
          const notifications = await Promise.all(
            notificationMembers.map(member =>
              notificationService.createNotification(member.userId, {
                type: 'PLAN_UPDATE',
                title: title,
                body: message,
                data: { planId: notifyPlanId },
              })
            )
          );
          return { message: `Notification sent to ${notificationMembers.length} members`, notifications };

        default:
          throw new Error(`Unknown tool: ${toolName}`);
      }
    } catch (error) {
      console.error(`Error executing tool ${toolName}:`, error);
      return {
        error: true,
        message: error.message || 'Failed to execute action',
      };
    }
  }

  /**
   * Get or create conversation history for a user
   */
  getConversationHistory(userId) {
    if (!this.conversationHistories.has(userId)) {
      this.conversationHistories.set(userId, []);
    }
    return this.conversationHistories.get(userId);
  }

  /**
   * Clear conversation history for a user
   */
  clearConversationHistory(userId) {
    this.conversationHistories.delete(userId);
  }

  /**
   * Process user message with AI agent
   */
  async chat(userId, userMessage, context = {}) {
    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        tools: [{ functionDeclarations: this.getAvailableTools() }],
      });

      const history = this.getConversationHistory(userId);

      const systemInstruction = `You are an AI assistant for TurnUp event planning. Help users create plans, activities, expenses, and more. Be friendly and execute actions using available tools.`;

      const chat = model.startChat({
        history: history,
        systemInstruction: systemInstruction,
      });

      let result = await chat.sendMessage(userMessage);
      let response = result.response;

      const toolCalls = [];
      const toolResults = [];

      if (response.functionCalls && response.functionCalls().length > 0) {
        const functionCalls = response.functionCalls();

        for (const functionCall of functionCalls) {
          console.log(`Executing: ${functionCall.name}`, functionCall.args);
          
          const toolResult = await this.executeTool(functionCall.name, functionCall.args, userId);
          
          toolCalls.push({ name: functionCall.name, args: functionCall.args });
          toolResults.push({ name: functionCall.name, result: toolResult });

          result = await chat.sendMessage([{
            functionResponse: { name: functionCall.name, response: toolResult }
          }]);
          response = result.response;
        }
      }

      // Update conversation history
      history.push(
        {
          role: 'user',
          parts: [{ text: userMessage }],
        },
        {
          role: 'model',
          parts: [{ text: finalText }],
        }
      );

      // Keep only last 20 messages to manage memory
      if (history.length > 20) {
        history.splice(0, history.length - 20);
      }

      return {
        message: finalText,
        toolCalls: toolCalls,
        toolResults: toolResults,
      };
    } catch (error) {
      console.error('AI Agent error:', error);
      throw new ApiError(500, `AI Agent error: ${error.message}`);
    }
  }

  /**
   * Get conversation history for a user
   */
  async getHistory(userId) {
    const history = this.getConversationHistory(userId);
    return history;
  }

  /**
   * Reset conversation for a user
   */
  async resetConversation(userId) {
    this.clearConversationHistory(userId);
    return { message: 'Conversation reset successfully' };
  }

  /**const finalText = response.text();

      history.push(
        { role: 'user', parts: [{ text: userMessage }] },
        { role: 'model', parts: [{ text: finalText }] }
      );

      if (history.length > 20) {
        history.splice(0, history.length - 20);
      }

      return { message: finalText, toolCalls, toolResults if (response.data.status !== 'OK') {
        return {
          error: true,
          message: `Failed to get directions: ${response.data.status}`,
          details: response.data.error_message || 'Unknown error',
        };
      }

      const route = response.data.routes[0];
      const leg = route.legs[0];

      return {
        success: true,
        distance: leg.distance.text,
        duration: leg.duration.text,
        start_address: leg.start_address,
        end_address: leg.end_address,
        steps: leg.steps.map(step => ({
          instruction: step.html_instructions.replace(/<[^>]*>/g, ''), // Remove HTML tags
          distance: step.distance.text,
          duration: step.duration.text,
        })),
        overview_polyline: route.overview_polyline.points,
      };
    } catch (error) {
      console.error('Google Maps Directions API error:', error);
      return {
        error: true,
        message: 'Failed to get directions',
        details: error.message,
      };
    }
  }

  /**
   * Search for places using Google Maps Places API
   */
  async searchGooglePlaces(query, location = null) {
    try {
      const axios = require('axios');
      const apiKey = process.env.MAP_API_KEY;

      if (!apiKey) {
        throw new Error('Google Maps API key not configured');
      }

      const params = {
        query,
        key: apiKey,
      };

      if (location) {
        params.location = location;
        params.radius = 5000; // 5km radius
      }

      const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
        params,
      });

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        return {
          error: true,
          message: `Failed to search places: ${response.data.status}`,
          details: response.data.error_message || 'Unknown error',
        };
      }

      const places = response.data.results.slice(0, 5).map(place => ({
        name: place.name,
        address: place.formatted_address,
        rating: place.rating,
        user_ratings_total: place.user_ratings_total,
        types: place.types,
        location: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
        },
        place_id: place.place_id,
      }));

      return {
        success: true,
        places,
        count: places.length,
      };
    } catch (error) {
      console.error('Google Maps Places API error:', error);
      return {
        error: true,
        message: 'Failed to search places',
        details: error.message,
      };
    }
  }
}

module.exports = new AIAgentService();
