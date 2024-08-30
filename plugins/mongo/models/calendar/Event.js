import ModelHelper from '../../helpers/models.js';

export default class Event extends ModelHelper {
  constructor(eventData) {
    super('events');
    this.modelFields = {
      title: { type: 'text', value: null },
      description: { type: 'textarea', value: null },
      location: { type: 'text', value: null },
      startDate: { type: 'date', value: null },
      endDate: { type: 'date', value: null },
      attendees: { type: 'array', value: [] }, // Array of user IDs
      maxAttendees: { type: 'number', value: null },
      status: { type: 'text', value: 'upcoming' }, // e.g., 'upcoming', 'ongoing', 'completed'
      createdAt: { type: 'date', value: new Date() },
      updatedAt: { type: 'date', value: new Date() },
    };

    if (eventData) {
      for (let key in this.modelFields) {
        if (eventData[key] !== undefined) {
          this.modelFields[key].value = eventData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new Event().modelFields).map((key) => {
      const field = new Event().modelFields[key];
      return { name: key, type: field.type };
    });
  }

  middlewareForCreateRoute() {
    return [
      this.validateEvent.bind(this),
      this.checkEventCapacity.bind(this),
    ];
  }

  middlewareForEditRoute() {
    return [
      this.validateEvent.bind(this),
    ];
  }

  async validateEvent(req, res, next) {
    try {
      const { title, startDate, endDate, location } = req.body;
      if (!title || !startDate || !endDate || !location) {
        throw new Error('Invalid event data: Title, start date, end date, and location are required.');
      }
      if (new Date(startDate) >= new Date(endDate)) {
        throw new Error('Invalid event data: Start date must be before the end date.');
      }
      next();
    } catch (error) {
      console.error('Error in validateEvent middleware:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async checkEventCapacity(req, res, next) {
    try {
      const { maxAttendees } = req.body;
      if (maxAttendees && maxAttendees < 0) {
        throw new Error('Invalid event data: Maximum attendees cannot be negative.');
      }
      next();
    } catch (error) {
      console.error('Error in checkEventCapacity middleware:', error);
      res.status(400).json({ error: error.message });
    }
  }

  pathForGetRouteView() {
    return 'admin/events/template';
  }

  async registerAttendee(eventId, userId) {
    try {
      const event = await this.getById(eventId);
      if (!event) {
        throw new Error('Event not found.');
      }
      if (event.attendees.includes(userId)) {
        throw new Error('User is already registered for this event.');
      }
      if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
        throw new Error('Event has reached maximum capacity.');
      }

      event.attendees.push(userId);
      event.updatedAt = new Date();
      await this.update(eventId, event);
    } catch (error) {
      console.error('Error in registerAttendee method:', error);
      throw error;
    }
  }

  async unregisterAttendee(eventId, userId) {
    try {
      const event = await this.getById(eventId);
      if (!event) {
        throw new Error('Event not found.');
      }
      if (!event.attendees.includes(userId)) {
        throw new Error('User is not registered for this event.');
      }

      event.attendees = event.attendees.filter(id => id !== userId);
      event.updatedAt = new Date();
      await this.update(eventId, event);
    } catch (error) {
      console.error('Error in unregisterAttendee method:', error);
      throw error;
    }
  }

  async updateEventStatus(eventId, status) {
    try {
      const event = await this.getById(eventId);
      if (!event) {
        throw new Error('Event not found.');
      }

      event.status = status;
      event.updatedAt = new Date();
      await this.update(eventId, event);
    } catch (error) {
      console.error('Error in updateEventStatus method:', error);
      throw error;
    }
  }
}
