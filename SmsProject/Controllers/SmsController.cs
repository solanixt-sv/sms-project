using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmsProject.Data;
using SmsProject.Models;

namespace SmsProject.Controllers
{
    public class SmsController : Controller
    {
        private readonly ApplicationDbContext _db;

        public SmsController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> Index()
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (!userId.HasValue) return RedirectToAction("Login", "Account");

            ViewBag.Friends = await _db.Friendships
                .Where(f => (f.User1Id == userId.Value || f.User2Id == userId.Value) && f.Status == "Accepted")
                .ToListAsync();

            ViewBag.Contacts = await _db.Contacts.Where(c => c.UserId == userId.Value).ToListAsync();
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> SendMessage(string receiverMobile, string messageBody)
        {
            var senderId = HttpContext.Session.GetInt32("UserId");
            if (!senderId.HasValue) return RedirectToAction("Login", "Account");

            if (string.IsNullOrEmpty(messageBody) || messageBody.Length > 120) {
                return Json(new { success = false, message = "Message must be 1-120 characters long." });
            }

            // Check Friendship
            var receiverUser = await _db.Users.FirstOrDefaultAsync(u => u.MobileNumber == receiverMobile);
            bool isFriend = false;
            
            if (receiverUser != null) {
                isFriend = await _db.Friendships.AnyAsync(f => 
                    ((f.User1Id == senderId && f.User2Id == receiverUser.Id) || (f.User1Id == receiverUser.Id && f.User2Id == senderId)) 
                    && f.Status == "Accepted");
            }

            if (!isFriend) {
                var messageCount = await _db.Messages.CountAsync(m => 
                    m.SenderId == senderId && m.ReceiverMobile == receiverMobile);
                
                if (messageCount >= 5) {
                    return Json(new { success = false, message = "Limit Reached! 5 free messages allowed for non-friends." });
                }
            }

            var newMessage = new Message {
                SenderId = senderId.Value,
                ReceiverMobile = receiverMobile,
                Body = messageBody,
                SentAt = DateTime.UtcNow
            };

            _db.Messages.Add(newMessage);
            await _db.SaveChangesAsync();

            return Json(new { success = true, message = "Message sent successfully!" });
        }
    }
}
