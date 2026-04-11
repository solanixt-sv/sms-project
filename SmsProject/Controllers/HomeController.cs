using Microsoft.AspNetCore.Mvc;
using SmsProject.Data;
using SmsProject.Models;

namespace SmsProject.Controllers
{
    public class HomeController : Controller
    {
        private readonly ApplicationDbContext _db;

        public HomeController(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<IActionResult> Index()
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue) return RedirectToAction("Login", "Account");

            var user = await _db.Users.FindAsync(userId.Value);
            if (user == null) return RedirectToAction("Login", "Account");

            return View(user);
        }

        public IActionResult Error()
        {
            return View();
        }
    }
}
