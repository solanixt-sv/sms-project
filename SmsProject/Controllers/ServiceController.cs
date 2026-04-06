using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmsProject.Data;
using SmsProject.Models;

namespace SmsProject.Controllers
{
    public class ServiceController : Controller
    {
        private readonly ApplicationDbContext _db;

        public ServiceController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> Index()
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue) return RedirectToAction("Login", "Account");

            ViewBag.Services = await _db.Friendships.Where(f => f.User1Id == userId.Value).ToListAsync(); // Simulated Subscriptions
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Activate(string serviceName, string cardNumber, string expiry, string cvv)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue) return RedirectToAction("Login", "Account");

            if (string.IsNullOrEmpty(cardNumber)) return RedirectToAction("Index");

            // Payment Logic simulation
            // ...

            return RedirectToAction("Index");
        }
    }
}
