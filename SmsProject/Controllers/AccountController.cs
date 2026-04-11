using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmsProject.Data;
using SmsProject.Models;

namespace SmsProject.Controllers
{
    public class AccountController : Controller
    {
        private readonly ApplicationDbContext _db;

        public AccountController(ApplicationDbContext db)
        {
            _db = db;
        }

        // --- Registration ---

        [HttpGet]
        public IActionResult Register() => View();

        [HttpPost]
        public async Task<IActionResult> Register(ApplicationUser user, string confirmPassword, string verificationCode)
        {
            if (user.Password != confirmPassword) {
                ModelState.AddModelError("Password", "Passwords do not match!");
                return View(user);
            }
            if (verificationCode != "1234") {
                ModelState.AddModelError("ActualCode", "Invalid verification code! (Use 1234)");
                return View(user);
            }

            if (await _db.Users.AnyAsync(u => u.MobileNumber == user.MobileNumber)) {
                ModelState.AddModelError("MobileNumber", "THIS MOBILE NUMBER had been registered already!");
                return View(user);
            }

            if (await _db.Users.AnyAsync(u => u.Username == user.Username)) {
                ModelState.AddModelError("Username", "Username is not available!");
                return View(user);
            }

            _db.Users.Add(user);
            await _db.SaveChangesAsync();
            return RedirectToAction("Login");
        }

        // --- Login ---

        [HttpGet]
        public IActionResult Login() => View();

        [HttpPost]
        public async Task<IActionResult> Login(string loginId, string password)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => 
                (u.Username == loginId || u.MobileNumber == loginId) && u.Password == password);

            if (user != null) {
                // Simplified Session handling for this demo
                HttpContext.Session.SetInt32("UserId", user.Id);
                return RedirectToAction("Index", "Home");
            }
            ModelState.AddModelError("", "Invalid credentials!");
            return View();
        }

        public IActionResult Logout() {
            HttpContext.Session.Clear();
            return RedirectToAction("Index", "Home");
        }

        // --- Profile Management ---

        [HttpGet]
        public async Task<IActionResult> Profile()
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue) return RedirectToAction("Login");

            var user = await _db.Users.FindAsync(userId.Value);
            return View(user);
        }

        [HttpPost]
        public async Task<IActionResult> EditPersonal(ApplicationUser model)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue) return RedirectToAction("Login");

            var user = await _db.Users.FindAsync(userId.Value);
            if (user != null) {
                user.FullName = model.FullName;
                user.Gender = model.Gender;
                user.DateOfBirth = model.DateOfBirth;
                user.Address = model.Address;
                user.MaritalStatus = model.MaritalStatus;
                user.Hobbies = model.Hobbies;
                await _db.SaveChangesAsync();
            }
            return RedirectToAction("Profile");
        }

        [HttpPost]
        public async Task<IActionResult> EditProfessional(ApplicationUser model)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue) return RedirectToAction("Login");

            var user = await _db.Users.FindAsync(userId.Value);
            if (user != null) {
                user.Qualification = model.Qualification;
                user.School = model.School;
                user.College = model.College;
                user.WorkStatus = model.WorkStatus;
                user.CompanyName = model.CompanyName;
                user.JobTitle = model.JobTitle;
                await _db.SaveChangesAsync();
            }
            return RedirectToAction("Profile");
        }

        [HttpPost]
        public async Task<IActionResult> UpdateProfile(ApplicationUser model)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue) return RedirectToAction("Login");

            var user = await _db.Users.FindAsync(userId.Value);
            if (user != null) {
                user.FullName = model.FullName;
                user.DateOfBirth = model.DateOfBirth;
                user.Address = model.Address;
                user.CompanyName = model.CompanyName;
                user.JobTitle = model.JobTitle;
                
                await _db.SaveChangesAsync();
                TempData["ProfileMsg"] = "Profile updated successfully!";
            }
            return RedirectToAction("Profile");
        }
    }
}
