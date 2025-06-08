(() => {
  'use strict';

  // Fetch blog posts from posts.json
  let blogPosts = [];

  const sections = {
    home: document.getElementById('home'),
    blogList: document.getElementById('blog'),
    blogPost: document.getElementById('blog-post'),
    contact: document.getElementById('contact')
  };

  const navButtons = {
    home: document.getElementById('nav-home'),
    blog: document.getElementById('nav-blog'),
    contact: document.getElementById('nav-contact')
  };

  const blogListContainer = document.getElementById('blog-list');
  const searchInput = document.getElementById('search-input');
  const blogPostTitle = sections.blogPost.querySelector('h2');
  const blogPostTime = sections.blogPost.querySelector('time');
  const blogPostTags = sections.blogPost.querySelector('.tags');
  const blogPostContent = sections.blogPost.querySelector('.content');
  const backBtn = sections.blogPost.querySelector('.back-btn');
  const networkStatus = document.getElementById('network-status');

  function formatDate(dateStr) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  }

  function showSection(name) {
    Object.entries(sections).forEach(([key, section]) => {
      if (key === name) {
        section.hidden = false;
        section.classList.add('active');
        section.setAttribute('tabindex', '0');
        section.focus();
      } else {
        section.hidden = true;
        section.classList.remove('active');
        section.removeAttribute('tabindex');
      }
    });

    Object.values(navButtons).forEach(btn => btn.removeAttribute('aria-current'));
    if (navButtons[name]) {
      navButtons[name].setAttribute('aria-current', 'page');
    }
  }

  function renderBlogList(filter = '') {
    blogListContainer.innerHTML = '';
    const filteredPosts = blogPosts.filter(post =>
      post.title.toLowerCase().includes(filter.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(filter.toLowerCase()))
    );
    if (filteredPosts.length === 0) {
      blogListContainer.innerHTML = '<p>პოტი ვერ მოიძებნა.</p>';
      return;
    }
    filteredPosts.forEach((post, index) => {
      const article = document.createElement('article');
      article.tabIndex = 0;
      article.setAttribute('role', 'listitem');
      article.dataset.index = index;

      article.innerHTML = `
        <h3>${post.title}</h3>
        <time datetime="${post.date}">${formatDate(post.date)}</time>
        <p class="excerpt">${post.excerpt}</p>
      `;

      article.addEventListener('click', () => showPost(index));
      article.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          showPost(index);
        }
      });

      blogListContainer.appendChild(article);
    });
  }

  function showPost(index) {
    const post = blogPosts[index];
    if (!post) return;

    blogPostTitle.textContent = post.title;
    blogPostTime.textContent = formatDate(post.date);
    blogPostTime.dateTime = post.date;

    blogPostTags.innerHTML = '';
    post.tags.forEach(tag => {
      const span = document.createElement('span');
      span.textContent = tag;
      blogPostTags.appendChild(span);
    });

    blogPostContent.innerHTML = post.content;

    showSection('blogPost');
  }

  backBtn.addEventListener('click', () => {
    showSection('blogList');
  });

  navButtons.home.addEventListener('click', () => showSection('home'));
  navButtons.blog.addEventListener('click', () => showSection('blogList'));
  navButtons.contact.addEventListener('click', () => showSection('contact'));

  searchInput.addEventListener('input', e => {
    renderBlogList(e.target.value);
  });

  // Network status update
  function updateNetworkStatus() {
    if (navigator.onLine) {
      networkStatus.textContent = '';
      networkStatus.style.backgroundColor = '#d4edda'; // light green
      networkStatus.style.color = '#155724'; // dark green
      networkStatus.style.display = 'block';
      setTimeout(() => {
        networkStatus.style.display = 'none';
      }, 3000);
    } else {
      networkStatus.textContent = '';
      networkStatus.style.backgroundColor = '#f8d7da'; // light red
      networkStatus.style.color = '#721c24'; // dark red
      networkStatus.style.display = 'block';
    }
  }

  window.addEventListener('online', updateNetworkStatus);
  window.addEventListener('offline', updateNetworkStatus);

  // Initial network status check
  updateNetworkStatus();

  // Homepage button to navigate to blog list
  document.getElementById('go-to-blog').addEventListener('click', () => {
    showSection('blogList');
  });

  // Load blog posts from JSON file and initialize app
  fetch('posts.json')
    .then(response => response.json())
    .then(data => {
      blogPosts = data;
      renderBlogList();
      showSection('home');
    })
    .catch(err => {
      console.error('Failed to load blog posts:', err);
      blogPosts = [];
      renderBlogList();
      showSection('home');
    });

})();
