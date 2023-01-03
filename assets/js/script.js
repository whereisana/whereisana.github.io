'use strict';



const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: "z9yzneui2lpo",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: "GltKC3ILj6IZ0KpnyxIZ2vZFVoNbcGG71svm0WHE4x8"
});


const blogList = document.querySelector("[data-blog-list]");
client
  .getEntries({
    content_type: 'blogPost',
    order:'sys.createdAt'
  })
  .then(function (entries) {
    entries.items.forEach(function (entry) {
      const title = entry.fields.title;
      const body = documentToHtmlString(entry.fields.body);
      const img = "https:" + entry.fields.image.fields.file.url;
      const date_str = new Date(entry.fields.date).toDateString();
      const date = date_str.slice(4, 10) + "," + date_str.slice(10);

      const listItem = `
      <li class="blog-post-item">
        <a href="#">
          <figure class="blog-banner-box">
            <img src="${img}" alt="${title}" loading="lazy">
          </figure>
          <div class="blog-content">
            <div class="blog-meta">
              <time datetime="${entry.fields.date}">${date}</time>
            </div>
            <h3 class="h3 blog-item-title">${title}</h3>
            <div class="blog-text">
              ${body}
            </div>
          </div>
        </a>
      </li>
      `;
      blogList.innerHTML += listItem;
    });
  });



// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }

// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () { 
  elementToggleFunc(sidebar);
  elementToggleFunc(sidebarBtn);
});


// testimonials variables
const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

// modal variable
const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");

// modal toggle function
const testimonialsModalFunc = function () {
  modalContainer.classList.toggle("active");
  overlay.classList.toggle("active");
}

// add click event to all modal items
for (let i = 0; i < testimonialsItem.length; i++) {

  testimonialsItem[i].addEventListener("click", function () {

    modalImg.src = this.querySelector("[data-testimonials-avatar]").src;
    modalImg.alt = this.querySelector("[data-testimonials-avatar]").alt;
    modalTitle.innerHTML = this.querySelector("[data-testimonials-title]").innerHTML;
    modalText.innerHTML = this.querySelector("[data-testimonials-text]").innerHTML;

    testimonialsModalFunc();

  });

}

// add click event to modal close button
modalCloseBtn.addEventListener("click", testimonialsModalFunc);
overlay.addEventListener("click", testimonialsModalFunc);


// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

// add event to all form input field
for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {
    // check form validation
    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }

  });
}

// use emailJS to send mail
form.addEventListener('submit', function(event) {
  event.preventDefault();

  const serviceID = "service_sjinwzl";
  const templateID = "template_1wxhbaa";
  const publicKey = "gKInRTbMp8an_GImj";

  const templateParams = {
    name: this.name.value,
    email: this.email.value,
    message: this.message.value
  };

  console.log(templateParams);

  emailjs.send(serviceID, templateID, templateParams, publicKey)
      .then(function(response) {
        console.log('SUCCESS!', response.status, response.text);
      }, function(error) {
          console.log('FAILED...', error);
      });
});



// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {

    for (let i = 0; i < pages.length; i++) {
      if (this.innerHTML.toLowerCase() === pages[i].dataset.page) {
        pages[i].classList.add("active");
        navigationLinks[i].classList.add("active");
        window.scrollTo(0, 0);
      } else {
        pages[i].classList.remove("active");
        navigationLinks[i].classList.remove("active");
      }
    }

  });
}


