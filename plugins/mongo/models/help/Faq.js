const ModelHelper = require('../helpers/models');

class Faq extends ModelHelper {
  constructor(faqData) {
    super('faqs');
    this.modelFields = {
      question: { type: 'text', value: null },
      answer: { type: 'textarea', value: null },
      category: { type: 'text', value: null },  // Useful to categorize FAQs
      tags: { type: 'array', value: [] },       // For easier search and filtering
      order: { type: 'number', value: null },   // For ordering FAQs in the UI
      visible: { type: 'boolean', value: true },// If the FAQ is currently visible
      creationDate: { type: 'date', value: new Date() },
      lastUpdated: { type: 'date', value: null },
    };

    if (faqData) {
      for (let key in this.modelFields) {
        if (faqData[key] !== undefined) {
          this.modelFields[key].value = faqData[key];
        }
      }
    }
  }

  static getModelFields() {
    return Object.keys(new Faq().modelFields).map(key => {
      const field = new Faq().modelFields[key];
      return { name: key, type: field.type };
    });
  }

  pathForGetRouteView() {
    return 'admin/faqs/template';
  }
}

module.exports = Faq;
