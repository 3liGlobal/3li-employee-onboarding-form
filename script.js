document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('onboardingFormPage1');
  var formPage2 = document.getElementById('onboardingFormPage2');

  var idFile = document.getElementById('idFile');
  var idLabel = document.getElementById('idLabel');
  var idFileName = document.getElementById('idFileName');
  var idFileClear = document.getElementById('idFileClear');
  let cnicUploads = [];

  async function getUserCountry() {
    try {
      const res = await fetch("https://api.country.is/");
      const data = await res.json();
      const country = data.country || "";
      console.log("User country:", country);
      return data.country; // e.g., "US"
    } catch (e) {
      console.error(e);
      return "";
    }
  }

  function updateCnicState() {
    if (cnicUploads.length === 0) {
      idLabel.textContent = "Upload CNIC/ID (Front)*";
      idFileName.textContent = "";
      idFileClear.style.display = "none";
      idFile.disabled = false;
    } else if (cnicUploads.length === 1) {
      idLabel.textContent = "Upload CNIC/ID (Back)*";
      idFileName.textContent = "Front: " + cnicUploads[0].name;
      idFileClear.style.display = "inline-block";
      idFile.disabled = false;
    } else if (cnicUploads.length === 2) {
      idLabel.textContent = "CNIC Uploaded";
      idFileName.textContent =
        "Front: " + cnicUploads[0].name + " | Back: " + cnicUploads[1].name;
      idFileClear.style.display = "inline-block";
      idFile.disabled = true;
    }
  }

  if (idFile) {
    idFile.addEventListener('change', function (e) {
      if (e.target.files.length > 0) {
        cnicUploads.push(e.target.files[0]);
        idFile.value = "";
        updateCnicState();
      }
    });
  }
  if (idFileClear) {
    idFileClear.addEventListener('click', function () {
      cnicUploads = [];
      idFile.value = "";
      updateCnicState();
    });
  }
  updateCnicState();

  // ===== RESUME UPLOAD =====
  var resumeFile = document.getElementById('resumeFile');
  var resumeFileName = document.getElementById('resumeFileName');
  var resumeFileClear = document.getElementById('resumeFileClear');

  function updateResumeState() {
    if (resumeFile && resumeFile.files && resumeFile.files.length > 0) {
      resumeFileName.textContent = resumeFile.files[0].name;
      resumeFileClear.style.display = "inline-block";
    } else {
      resumeFileName.textContent = "";
      resumeFileClear.style.display = "none";
    }
  }

  if (resumeFile) {
    resumeFile.addEventListener('change', function () {
      updateResumeState();
      validateField(resumeFile);
    });
  }
  if (resumeFileClear) {
    resumeFileClear.addEventListener('click', function () {
      resumeFile.value = "";
      updateResumeState();
      validateField(resumeFile);
    });
  }
  updateResumeState();

  // ===== VALIDATION =====
  var requiredNames = new Set([
    'firstName', 'lastName', 'gender', 'dateOfBirth', 'nationality', 'cnicPassportNumber',
    'maritalStatus', 'phoneNumber', 'personalEmail', 'emergencyCName', 'emergencyCNumber', 'relationshipToContact',
    'resumeFile',
    'streetAddress', 'city', 'postalCode', 'state', 'country'
  ]);

  function getErrorElement(field) {
    var current = field.parentElement;
    while (current && current !== document.body) {
      var error = current.querySelector && current.querySelector('.error');
      if (error) return error;
      current = current.parentElement;
    }
    return null;
  }

  function validateField(field) {
    if (!field || !field.name) return true;
    var name = field.name;
    var value = field.value != null ? String(field.value).trim() : '';
    var errorEl = getErrorElement(field);
    var isValid = true;

    // CNIC front + back
    if (field.id === "idFile") {
      isValid = cnicUploads.length === 2; // require both
    } else if (requiredNames.has(name)) {
      if (field.type === 'file') {
        isValid = field.files && field.files.length > 0;
      } else if (field.tagName === 'SELECT') {
        isValid = value !== '';
      } else {
        isValid = value !== '';
      }
    }

    if (isValid && (name === 'phoneNumber' || name === 'emergencyCNumber')) {
      var phoneRegex = /^[0-9]{10,15}$/;
      isValid = phoneRegex.test(value);
    }
    if (isValid && name === 'personalEmail') {
      var emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
      isValid = emailRegex.test(value);
    }
    if (errorEl) errorEl.style.display = isValid ? 'none' : 'block';
    return isValid;
  }

  function validateForm(formEl) {
    var fields = formEl.querySelectorAll('input, select');
    var allValid = true;
    fields.forEach(function (field) {
      if (!validateField(field)) allValid = false;
    });

    if (cnicUploads.length !== 2) {
      var cnicError = getErrorElement(idFile);
      if (cnicError) cnicError.style.display = 'block';
      allValid = false;
    }
    return allValid;
  }

  form.addEventListener('input', function (e) {
    var target = e.target;
    if (target.matches('input[type="text"], input[type="email"], input[type="tel"], input[type="date"]')) {
      validateField(target);
    }
  });
  form.addEventListener('change', function (e) {
    var target = e.target;
    if (target.matches('select, input[type="file"]')) {
      validateField(target);
    }
  });

  formPage2.addEventListener('submit', async function (e) {
    e.preventDefault();
    var page2Valid = validateForm(formPage2);
    var page1Valid = validateForm(form);

    if (page1Valid && page2Valid) {
      var formData = new FormData();

      // Add files
      cnicUploads.forEach(file => {
        formData.append("cnicPassportFile", file);
      });
      if (resumeFile && resumeFile.files.length > 0) {
        formData.append("resumeCV", resumeFile.files[0]);
      }

      // Append inputs from page 1
      form.querySelectorAll('input, select').forEach(input => {
        if (input.type !== "file") {
          formData.append(input.name, input.value.trim());
        }
      });

      // Append inputs from page 2
      formPage2.querySelectorAll('input, select').forEach(input => {
        if (input.type !== "file") {
          formData.append(input.name, input.value.trim());
        }
      });

      const country = await getUserCountry();
      console.log("Country to append:", country);
      formData.append("usageLocation", country);

      // Append usageLocation dynamically
      // formData.append("usageLocation", await getUserCountry());

      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ', pair[1]);
      }

      fetch('http://localhost:3000/api/employee/onboarding', {
        method: 'POST',
        body: formData
      })
        .then(response => {
          if (!response.ok) {
            console.error('Error status:', response.status, response.statusText);
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          alert('Form submitted successfully!');
          form.reset();
          formPage2.reset();
          cnicUploads = [];
          updateCnicState();
          updateResumeState();
          form.querySelectorAll('.error').forEach(el => el.style.display = 'none');
          formPage2.querySelectorAll('.error').forEach(el => el.style.display = 'none');
        })
        .catch(error => {
          alert('Error submitting form: ' + error.message);
          console.error("Fetch error:", error);
        });
    } else {
      alert('Please fill all required fields properly before submitting.');
    }
  });

  // Add validation on Page 2 inputs as well, similar to page 1
  if (formPage2) {
    formPage2.addEventListener('input', function (e) {
      var target = e.target;
      if (target.matches('input[type="text"], input[type="email"], input[type="tel"], input[type="date"]')) {
        validateField(target);
      }
    });
    formPage2.addEventListener('change', function (e) {
      var target = e.target;
      if (target.matches('select, input[type="file"]')) {
        validateField(target);
      }
    });
  }

  const nextPageBtn = document.getElementById("nextPage");
  const prevPageBtn = document.getElementById("prevPage");

  nextPageBtn.addEventListener("click", function () {
    const page1Valid = validateForm(form);
    if (!page1Valid) {
      alert("Please fill out all required fields on Page 1 before continuing.");
      return;
    }

    // Move to Page 2
    document.getElementById("page1").style.display = "none";
    document.getElementById("page2").style.display = "flex";
  });

  prevPageBtn.addEventListener("click", function () {
    document.getElementById("page2").style.display = "none";
    document.getElementById("page1").style.display = "flex";
  });

});
