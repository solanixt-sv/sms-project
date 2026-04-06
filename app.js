/**
 * AppState - Centralized local storage management
 */
const AppState = {
  get: (key) => JSON.parse(localStorage.getItem(`sms_site_${key}`)),
  set: (key, value) => localStorage.setItem(`sms_site_${key}`, JSON.stringify(value)),
  
  currentUser: null,
  users: [],
  contacts: [],
  messages: [],
  friendRequests: [],
  friends: [],
  services: [],

  init() {
    this.users = this.get('users') || [];
    this.contacts = this.get('contacts') || [];
    this.messages = this.get('messages') || [];
    this.friendRequests = this.get('friendRequests') || [];
    this.friends = this.get('friends') || [];
    this.services = this.get('services') || [];
    this.currentUser = this.get('currentUser') || null;
  },

  save() {
    this.set('users', this.users);
    this.set('contacts', this.contacts);
    this.set('messages', this.messages);
    this.set('friendRequests', this.friendRequests);
    this.set('friends', this.friends);
    this.set('services', this.services);
    this.set('currentUser', this.currentUser);
  }
};
window.AppState = AppState;

/**
 * Router - Simple SPA routing system
 */
const Router = {
  views: {
    home: 'tpl-home',
    login: 'tpl-login',
    register: 'tpl-register',
    profile: 'tpl-profile',
    messages: 'tpl-messages',
    friends: 'tpl-friends',
    contacts: 'tpl-contacts',
    services: 'tpl-services'
  },

  navigate(viewName) {
    const appView = document.getElementById('app-view');
    const tpl = document.getElementById(`tpl-${viewName}`);
    
    // Clear and Append
    appView.innerHTML = tpl ? tpl.innerHTML : '<h2>404 View Not Found</h2>';
    
    // Update active nav link
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
    const navLink = document.getElementById(`nav-${viewName}`);
    if (navLink) navLink.classList.add('active');

    // Run view-specific init
    this.initView(viewName);
    
    // Re-create icons
    if (window.lucide) lucide.createIcons();
  },

  initView(viewName) {
    console.log(`Navigated to ${viewName}`);
    switch(viewName) {
      case 'register': Auth.initRegister(); break;
      case 'login': Auth.initLogin(); break;
      case 'profile': Profile.init(); break;
      case 'messages': Messaging.init(); break;
      case 'friends': Social.init(); break;
      case 'contacts': Contacts.init(); break;
      case 'services': Services.init(); break;
    }
  }
};
window.Router = Router;

/**
 * Auth Module - Registration & Login Logic
 */
const Auth = {
  verificationCode: '',

  initRegister() {
    const form = document.getElementById('register-form');
    const vDisplay = document.getElementById('verification-display');
    this.verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    if(vDisplay) vDisplay.innerText = this.verificationCode;

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = {
        username: document.getElementById('reg-username').value,
        password: document.getElementById('reg-password').value,
        confirm: document.getElementById('reg-confirm-password').value,
        email: document.getElementById('reg-email').value,
        mobile: document.getElementById('reg-mobile').value,
        verification: document.getElementById('reg-verification').value,
        profile: {},
        professional: {},
        createdAt: new Date().toISOString()
      };

      if (user.password !== user.confirm) return alert("Passwords do not match!");
      if (user.verification !== this.verificationCode) return alert("Invalid verification code!");
      if (AppState.users.find(u => u.mobile === user.mobile)) return alert("THIS MOBILE NUMBER had been registered already");
      if (AppState.users.find(u => u.username === user.username)) return alert("Username already taken!");

      AppState.users.push(user);
      AppState.currentUser = user;
      AppState.save();
      alert("Registration Successful!");
      Router.navigate('profile');
      this.updateNavbar();
    });
  },

  initLogin() {
    const form = document.getElementById('login-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('login-id').value;
      const pass = document.getElementById('login-password').value;
      const user = AppState.users.find(u => (u.username === id || u.mobile === id) && u.password === pass);

      if (user) {
        AppState.currentUser = user;
        AppState.save();
        Router.navigate('profile');
        this.updateNavbar();
      } else {
        alert("Invalid credentials!");
      }
    });
  },

  logout() {
    AppState.currentUser = null;
    AppState.save();
    Router.navigate('home');
    this.updateNavbar();
  },

  updateNavbar() {
    const authActions = document.getElementById('auth-actions');
    if (AppState.currentUser) {
      if (authActions) {
        authActions.innerHTML = `
          <span style="margin-right: 1rem; color: var(--text-secondary);">Hi, ${AppState.currentUser.username}</span>
          <button class="btn-secondary" onclick="Auth.logout()">Logout</button>
        `;
      }
    } else {
      if (authActions) {
        authActions.innerHTML = `<button class="btn-secondary" onclick="Router.navigate('login')">Login</button>`;
      }
    }
  }
};
window.Auth = Auth;

/**
 * Profile Module
 */
const Profile = {
  init() {
    if (!AppState.currentUser) return Router.navigate('login');
    const user = AppState.currentUser;
    const pForm = document.getElementById('personal-form');
    if (pForm) {
      document.getElementById('prof-name').value = user.profile.name || '';
      document.getElementById('prof-gender').value = user.profile.gender || 'Male';
      document.getElementById('prof-dob').value = user.profile.dob || '';
      document.getElementById('prof-marital').value = user.profile.marital || 'Single';
      document.getElementById('prof-address').value = user.profile.address || '';
      document.getElementById('prof-hobbies').value = user.profile.hobbies || '';

      pForm.onsubmit = (e) => {
        e.preventDefault();
        user.profile = {
          name: document.getElementById('prof-name').value,
          gender: document.getElementById('prof-gender').value,
          dob: document.getElementById('prof-dob').value,
          marital: document.getElementById('prof-marital').value,
          address: document.getElementById('prof-address').value,
          hobbies: document.getElementById('prof-hobbies').value
        };
        AppState.save();
        alert("Personal details updated!");
      };
    }
    const profForm = document.getElementById('professional-form');
    if (profForm) {
      document.getElementById('prof-qual').value = user.professional.qualification || '';
      document.getElementById('prof-work').value = user.professional.workStatus || 'Employed';
      document.getElementById('prof-org').value = user.professional.organization || '';
      document.getElementById('prof-desig').value = user.professional.designation || '';
      profForm.onsubmit = (e) => {
        e.preventDefault();
        user.professional = {
          qualification: document.getElementById('prof-qual').value,
          workStatus: document.getElementById('prof-work').value,
          organization: document.getElementById('prof-org').value,
          designation: document.getElementById('prof-desig').value
        };
        AppState.save();
        alert("Professional details updated!");
      };
    }
  }
};

/**
 * Contacts Module
 */
const Contacts = {
  init() {
    if (!AppState.currentUser) return Router.navigate('login');
    this.render();
    const form = document.getElementById('add-contact-form');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const contact = {
          owner: AppState.currentUser.mobile,
          fname: document.getElementById('cont-fname').value,
          lname: document.getElementById('cont-lname').value,
          number: document.getElementById('cont-number').value
        };
        AppState.contacts.push(contact);
        AppState.save();
        alert("Contact added!");
        form.reset();
        this.render();
      };
    }
  },

  render() {
    const list = document.getElementById('contacts-list-container');
    if (!list) return;
    const myContacts = AppState.contacts.filter(c => c.owner === AppState.currentUser.mobile);
    list.innerHTML = myContacts.length ? '' : '<p style="color: var(--text-secondary);">No contacts added yet.</p>';
    myContacts.forEach((c, idx) => {
      const div = document.createElement('div');
      div.className = 'glass-card';
      div.style.padding = '1rem';
      div.style.display = 'flex';
      div.style.justifyContent = 'space-between';
      div.innerHTML = `
        <div>
          <strong>${c.fname} ${c.lname}</strong><br>
          <small>${c.number}</small>
        </div>
        <button class="btn-secondary" style="padding: 0.4rem;" onclick="Contacts.delete(${idx})"><i data-lucide="trash-2"></i></button>
      `;
      list.appendChild(div);
    });
    if (window.lucide) lucide.createIcons();
  },

  delete(idx) {
    if (confirm("Delete this contact?")) {
      const myContacts = AppState.contacts.filter(c => c.owner === AppState.currentUser.mobile);
      const target = myContacts[idx];
      AppState.contacts = AppState.contacts.filter(c => c !== target);
      AppState.save();
      this.render();
    }
  }
};

/**
 * Messaging Module
 */
const Messaging = {
  init() {
    if (!AppState.currentUser) return Router.navigate('login');
    const friendSelect = document.getElementById('msg-friend-select');
    const userFriends = AppState.friends.filter(f => f.user1 === AppState.currentUser.mobile || f.user2 === AppState.currentUser.mobile);
    if (friendSelect) {
      friendSelect.innerHTML = userFriends.length ? '' : '<option disabled>No friends yet</option>';
      userFriends.forEach(f => {
        const friendMobile = f.user1 === AppState.currentUser.mobile ? f.user2 : f.user1;
        const friendUser = AppState.users.find(u => u.mobile === friendMobile);
        const option = document.createElement('option');
        option.value = friendMobile;
        option.innerText = friendUser ? friendUser.username : friendMobile;
        friendSelect.appendChild(option);
      });
    }
    const setupCharCounter = (txtId, counterId) => {
      const txt = document.getElementById(txtId);
      const counter = document.getElementById(counterId);
      if (txt && counter) {
        txt.oninput = () => counter.innerText = `${txt.value.length} / 120`;
      }
    };
    setupCharCounter('msg-friend-text', 'char-count-friend');
    setupCharCounter('msg-nf-text', 'char-count-nf');
    const fForm = document.getElementById('msg-friend-form');
    if (fForm) {
      fForm.onsubmit = (e) => {
        e.preventDefault();
        const text = document.getElementById('msg-friend-text').value;
        if (!text) return alert("Message cannot be empty!");
        alert("Message sent to friend successfully (Unlimited Free)!");
        document.getElementById('msg-friend-text').value = '';
      };
    }
    const nfForm = document.getElementById('msg-nonfriend-form');
    if (nfForm) {
      nfForm.onsubmit = (e) => {
        e.preventDefault();
        const num = document.getElementById('msg-nf-number').value;
        const text = document.getElementById('msg-nf-text').value;
        if (!num || !text) return alert("Please fill all fields!");
        const sentCount = (AppState.messages.filter(m => m.from === AppState.currentUser.mobile && m.to === num)).length;
        if (sentCount >= 5) return alert("Limit Reached! Only 5 messages are allowed to send free to any single mobile number.");
        AppState.messages.push({ from: AppState.currentUser.mobile, to: num, text: text, date: new Date() });
        AppState.save();
        alert(`Message sent! (${sentCount + 1}/5 used for this number)`);
        document.getElementById('msg-nf-text').value = '';
      };
    }
  },

  showContactPicker() {
    const modal = document.getElementById('contact-picker-modal');
    const list = document.getElementById('picker-list');
    const myContacts = AppState.contacts.filter(c => c.owner === AppState.currentUser.mobile);
    
    list.innerHTML = myContacts.length ? '' : '<p style="color: var(--text-secondary); padding: 1rem;">No contacts found.</p>';
    myContacts.forEach(c => {
      const div = document.createElement('div');
      div.className = 'glass-card';
      div.style.padding = '0.8rem';
      div.style.cursor = 'pointer';
      div.innerHTML = `<strong>${c.fname} ${c.lname}</strong><br><small>${c.number}</small>`;
      div.onclick = () => {
        document.getElementById('msg-nf-number').value = c.number;
        modal.style.display = 'none';
      };
      list.appendChild(div);
    });
    modal.style.display = 'block';
  }
};

/**
 * Social Module
 */
const Social = {
  init() {
    if (!AppState.currentUser) return Router.navigate('login');
    this.renderRequests();
    this.renderFriends();
    const srForm = document.getElementById('send-request-form');
    if (srForm) {
      srForm.onsubmit = (e) => {
        e.preventDefault();
        const email = document.getElementById('req-email-id').value;
        const targetUser = AppState.users.find(u => u.email === email);
        if (!targetUser) return alert("User not found with this email!");
        if (targetUser.mobile === AppState.currentUser.mobile) return alert("You cannot send request to yourself!");
        if (AppState.friendRequests.find(r => r.from === AppState.currentUser.mobile && r.to === targetUser.mobile)) {
          return alert("Request already sent!");
        }
        AppState.friendRequests.push({ from: AppState.currentUser.mobile, to: targetUser.mobile, status: 'pending' });
        AppState.save();
        alert("Friend request sent!");
        document.getElementById('req-email-id').value = '';
      };
    }
  },
  renderRequests() {
    const list = document.getElementById('friend-requests-list');
    if (!list) return;
    const requests = AppState.friendRequests.filter(r => r.to === AppState.currentUser.mobile && r.status === 'pending');
    list.innerHTML = requests.length ? '' : '<p style="color: var(--text-secondary);">No pending requests.</p>';
    requests.forEach(r => {
      const fromUser = AppState.users.find(u => u.mobile === r.from);
      const div = document.createElement('div');
      div.className = 'glass-card';
      div.style.padding = '1rem';
      div.style.display = 'flex';
      div.style.justifyContent = 'space-between';
      div.innerHTML = `
        <span>${fromUser ? fromUser.username : r.from} (${r.from})</span>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn-primary" style="padding: 0.4rem 1rem;" onclick="Social.handleRequest('${r.from}', true)">Accept</button>
          <button class="btn-secondary" style="padding: 0.4rem 1rem;" onclick="Social.handleRequest('${r.from}', false)">Reject</button>
        </div>
      `;
      list.appendChild(div);
    });
  },
  handleRequest(fromMobile, accept) {
    const req = AppState.friendRequests.find(r => r.from === fromMobile && r.to === AppState.currentUser.mobile);
    if (req) {
      if (accept) {
        req.status = 'accepted';
        AppState.friends.push({ user1: fromMobile, user2: AppState.currentUser.mobile });
        alert("Friend request accepted!");
      } else {
        req.status = 'rejected';
        alert("Friend request rejected!");
      }
      AppState.save();
      this.renderRequests();
      this.renderFriends();
    }
  },
  renderFriends() {
    const list = document.getElementById('friends-list-container');
    if (!list) return;
    const myFriends = AppState.friends.filter(f => f.user1 === AppState.currentUser.mobile || f.user2 === AppState.currentUser.mobile);
    list.innerHTML = myFriends.length ? '' : '<p style="color: var(--text-secondary);">Your friend list is empty.</p>';
    myFriends.forEach(f => {
      const friendMobile = f.user1 === AppState.currentUser.mobile ? f.user2 : f.user1;
      const friendUser = AppState.users.find(u => u.mobile === friendMobile);
      const div = document.createElement('div');
      div.className = 'glass-card';
      div.style.padding = '1.2rem';
      div.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1rem;">
          <div style="width: 40px; height: 40px; background: var(--primary-gradient); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <i data-lucide="user" style="width: 20px;"></i>
          </div>
          <div>
            <strong>${friendUser ? friendUser.username : 'Unknown'}</strong><br>
            <small style="color: var(--text-secondary);">${friendMobile}</small>
          </div>
        </div>
      `;
      list.appendChild(div);
    });
    if (window.lucide) lucide.createIcons();
  }
};

/**
 * Services Module
 */
const Services = {
  init() {
    if (!AppState.currentUser) return Router.navigate('login');
    const checks = document.querySelectorAll('.svc-check');
    const userServices = AppState.services.find(s => s.mobile === AppState.currentUser.mobile) || { services: [] };
    checks.forEach(c => {
      c.checked = userServices.services.includes(c.id);
      c.disabled = c.checked;
    });
    const payForm = document.getElementById('payment-form');
    if (payForm) {
      payForm.onsubmit = (e) => {
        e.preventDefault();
        const selected = Array.from(document.querySelectorAll('.svc-check:checked:not(:disabled)')).map(c => c.id);
        if (!selected.length) return alert("Select new services to activate!");
        let svcRepo = AppState.services.find(s => s.mobile === AppState.currentUser.mobile);
        if (!svcRepo) {
          svcRepo = { mobile: AppState.currentUser.mobile, services: [] };
          AppState.services.push(svcRepo);
        }
        svcRepo.services = [...new Set([...svcRepo.services, ...selected])];
        AppState.save();
        alert("Payment Successful! Services Activated.");
        Router.navigate('services');
      };
    }
  },
  showPayment() {
    const paySec = document.getElementById('payment-section');
    const payBtn = document.getElementById('show-payment-btn');
    if (paySec) paySec.style.display = 'block';
    if (payBtn) payBtn.style.display = 'none';
  }
};

// Expose objects to window for nav clicks
window.Router = Router; 
window.Auth = Auth;
window.Profile = Profile;
window.Contacts = Contacts;
window.Messaging = Messaging;
window.Social = Social;
window.Services = Services;

// Initial Load
window.addEventListener('DOMContentLoaded', () => {
    AppState.init();
    Router.navigate(AppState.currentUser ? 'profile' : 'home');
    Auth.updateNavbar();
});
