export default (fields, data = {}) => {
  return fields.map((field) => {
    switch (field.type) {
      case 'text':
      case 'number':
      case 'date':
      case 'color':
        return {
          label: field.label || field.name,
          name: field.name,
          type: field.type,
          value: data[field.name] || '',
        };
      case 'textarea':
        return {
          label: field.label || field.name,
          name: field.name,
          type: field.type,
          value: data[field.name] || '',
        };
      case 'dropdown':
        return {
          label: field.label || field.name,
          name: field.name,
          type: field.type,
          options: field.options,
          value: data[field.name] || '',
        };
      case 'file':
        return {
          label: field.label || field.name,
          name: field.name,
          type: field.type,
        };
      case 'radio':
        return {
          label: field.label || field.name,
          name: field.name,
          type: field.type,
          options: field.options,
          value: data[field.name] || '',
        };
      case 'range':
        return {
          label: field.label || field.name,
          name: field.name,
          type: field.type,
          min: field.min,
          max: field.max,
          value: data[field.name] || '',
        };
      case 'boolean':
        return {
          label: field.label || field.name,
          name: field.name,
          type: field.type,
          value: data[field.name] || '',
        };
      default:
        return {
          label: field.label || field.name,
          name: field.name,
          type: 'text',
          value: data[field.name] || '',
        };
    }
  });
};
