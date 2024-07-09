function generateFormFields(model, fileFields = []) {
    return Object.keys(model).map(key => {
      if (fileFields.includes(key)) {
        return `
          <label for="${key}">${capitalizeFirstLetter(key)}:</label>
          <input type="file" id="${key}" name="${key}">
          <br>
        `;
      } else {
        return `
          <label for="${key}">${capitalizeFirstLetter(key)}:</label>
          <input type="text" id="${key}" name="${key}" value="${model[key] || ''}">
          <br>
        `;
      }
    }).join('');
  }
  
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
  module.exports = {
    generateFormFields,
  };
  