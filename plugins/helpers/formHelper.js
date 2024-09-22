export default (fields, data = {}, additionalData = {}) => {
  return fields.map((field) => {
    switch (field.type) {
      case 'text':
      case 'number':
      case 'date':
      case 'color':
        return {
          label: field.name.charAt(0).toUpperCase() + field.name.slice(1),
          name: field.name,
          type: field.type,
          value: data[field.name] || '',
        };
      case 'textarea':
        return {
          label: field.name.charAt(0).toUpperCase() + field.name.slice(1),
          name: field.name,
          type: field.type,
          value: data[field.name] || '',
        };
      case 'dropdown':
        return {
          name: field.name,
          label: field.name.charAt(0).toUpperCase() + field.name.slice(1),
          type: 'dropdown',
          options: additionalData[field.name] || [], // Use additionalData for dropdowns
          value: data[field.name] || '',  // Use data for current value
        };
      case 'file':
        return {
          label: field.name.charAt(0).toUpperCase() + field.name.slice(1),
          name: field.name,
          type: field.type,
        };
      case 'radio':
        return {
          label: field.name.charAt(0).toUpperCase() + field.name.slice(1),
          name: field.name,
          type: field.type,
          options: field.options || [],
          value: data[field.name] || '',
        };
        case 'boolean':
          return {
            label: field.name.charAt(0).toUpperCase() + field.name.slice(1),
            name: field.name,
            type: 'select',
            options: [
              { value: 'true', label: 'True' },
              { value: 'false', label: 'False' }
            ],
            value: data[field.name] !== undefined ? String(data[field.name]) : '',  // Convert boolean to string
          };
        
      case 'custom':
        return {
          label: field.name.charAt(0).toUpperCase() + field.name.slice(1),
          name: field.name,
          type: 'select',
          options: field.options || [], // Custom options for select
          value: data[field.name] || [],
          multiple: true, // Assuming it's a multi-select
        };
      default:
        return {
          label: field.name.charAt(0).toUpperCase() + field.name.slice(1),
          name: field.name,
          type: 'text',
          value: data[field.name] || '',
        };
    }
  });
};
