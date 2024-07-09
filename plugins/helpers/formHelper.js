const generateFormFields = (fields) => {
  return fields.map(field => {
    switch (field.type) {
      case 'text':
      case 'number':
      case 'date':
      case 'color':
        return `<label for="${field.name}">${field.name}</label>
                <input type="${field.type}" id="${field.name}" name="${field.name}" value="${field.value || ''}" />`;
      case 'textarea':
        return `<label for="${field.name}">${field.name}</label>
                <textarea id="${field.name}" name="${field.name}">${field.value || ''}</textarea>`;
      case 'dropdown':
        const options = field.options.map(option => `<option value="${option}">${option}</option>`).join('');
        return `<label for="${field.name}">${field.name}</label>
                <select id="${field.name}" name="${field.name}">${options}</select>`;
      case 'file':
        return `<label for="${field.name}">${field.name}</label>
                <input type="file" id="${field.name}" name="${field.name}" />`;
      default:
        return '';
    }
  }).join('');
};

module.exports = { generateFormFields };
