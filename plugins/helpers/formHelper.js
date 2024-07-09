const generateFormFields = (fields) => {
  return fields.map(field => {
    switch (field.type) {
      case 'text':
      case 'number':
      case 'date':
      case 'color':
        return `
          <label for="${field.name}">${field.label || field.name}</label>
          <input type="${field.type}" id="${field.name}" name="${field.name}" value="${field.value || ''}" />
        `;
      case 'textarea':
        return `
          <label for="${field.name}">${field.label || field.name}</label>
          <textarea id="${field.name}" name="${field.name}">${field.value || ''}</textarea>
        `;
      case 'dropdown':
        const options = field.options.map(option => `<option value="${option}" ${field.value === option ? 'selected' : ''}>${option}</option>`).join('');
        return `
          <label for="${field.name}">${field.label || field.name}</label>
          <select id="${field.name}" name="${field.name}">${options}</select>
        `;
      case 'file':
        return `
          <label for="${field.name}">${field.label || field.name}</label>
          <input type="file" id="${field.name}" name="${field.name}" />
        `;
      case 'radio':
        const radioButtons = field.options.map(option => `
          <input type="radio" id="${field.name}-${option}" name="${field.name}" value="${option}" ${field.value === option ? 'checked' : ''} />
          <label for="${field.name}-${option}">${option}</label>
        `).join('');
        return `
          <label>${field.label || field.name}</label>
          <div>${radioButtons}</div>
        `;
      case 'range':
        return `
          <label for="${field.name}">${field.label || field.name}</label>
          <input type="range" id="${field.name}" name="${field.name}" min="${field.min}" max="${field.max}" value="${field.value || ''}" />
        `;
      case 'boolean':
        return `
          <label>${field.label || field.name}</label>
          <div>
            <input type="radio" id="${field.name}-true" name="${field.name}" value="true" ${field.value === 'true' ? 'checked' : ''} />
            <label for="${field.name}-true">True</label>
            <input type="radio" id="${field.name}-false" name="${field.name}" value="false" ${field.value === 'false' ? 'checked' : ''} />
            <label for="${field.name}-false">False</label>
          </div>
        `;
      default:
        return '';
    }
  }).join('');
};

module.exports = { generateFormFields };
