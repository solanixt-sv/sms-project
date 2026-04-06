using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmsProject.Data;
using SmsProject.Models;

namespace SmsProject.Controllers
{
    public class SocialController : Controller
    {
        private readonly ApplicationDbContext _db;

        public SocialController(ApplicationDbContext db)
        {
            _db = db;
        }

        // --- Contacts ---

        [HttpGet]
        public async Task<IActionResult> Contacts()
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue) return RedirectToAction("Login", "Account");

            var contacts = await _db.Contacts.Where(c => c.UserId == userId.Value).ToListAsync();
            return View(contacts);
        }

        [HttpPost]
        public async Task<IActionResult> AddContact(Contact contact)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue) return RedirectToAction("Login", "Account");

            contact.UserId = userId.Value;
            _db.Contacts.Add(contact);
            await _db.SaveChangesAsync();
            return RedirectToAction("Contacts");
        }

        // --- Friends ---

        [HttpGet]
        public async Task<IActionResult> Friends()
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue) return RedirectToAction("Login", "Account");

            ViewBag.Requests = await _db.Friendships
                .Where(f => f.User2Id == userId.Value && f.Status == "Pending")
                .ToListAsync();

            ViewBag.MyFriends = await _db.Friendships
                .Where(f => (f.User1Id == userId.Value || f.User2Id == userId.Value) && f.Status == "Accepted")
                .ToListAsync();

            return View();
        }

        [HttpPost]
        public async Task<IActionResult> SendRequest(string emailId)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue) return RedirectToAction("Login", "Account");

            var targetUser = await _db.Users.FirstOrDefaultAsync(u => u.Email == emailId);
            if (targetUser == null || targetUser.Id == userId.Value) return RedirectToAction("Friends");

            bool exists = await _db.Friendships.AnyAsync(f => 
                (f.User1Id == userId.Value && f.User2Id == targetUser.Id) || (f.User1Id == targetUser.Id && f.User2Id == userId.Value));

            if (!exists) {
                var request = new Friendship { User1Id = userId.Value, User2Id = targetUser.Id, Status = "Pending" };
                _db.Friendships.Add(request);
                await _db.SaveChangesAsync();
            }
            return RedirectToAction("Friends");
        }

        [HttpPost]
        public async Task<IActionResult> HandleRequest(int requestId, string status)
        {
            var friendship = await _db.Friendships.FindAsync(requestId);
            if (friendship != null) {
                friendship.Status = status;
                await _db.SaveChangesAsync();
            }
            return RedirectToAction("Friends");
        }
    }
}
