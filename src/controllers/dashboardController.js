const Appointment = require('../models/Appointment');
const Blog = require('../models/Blog');
const BlogCategory = require('../models/BlogCategory');
const Contact = require('../models/Contact');
const Service = require('../models/Service');
const Testimonial = require('../models/Testimonial');
const Faq = require('../models/Faq');

function toISODateOnly(d) {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString().slice(0, 10);
}

const getDashboardCounts = async (req, res, next) => {
  try {
    const today = toISODateOnly(new Date());

    const [
      servicesActive,
      servicesInactive,
      blogsPublished,
      blogsUnpublished,
      blogCategoriesActive,
      blogCategoriesInactive,
      testimonialsApproved,
      testimonialsPending,
      faqsActive,
      faqsInactive,
      contactsReplied,
      contactsNotReplied,
      appointmentsTotal,
      appointmentsPending,
      appointmentsApproved,
      appointmentsRejected,
      appointmentsTodayTotal,
      appointmentsTodayPending,
      appointmentsTodayApproved,
    ] = await Promise.all([
      Service.countDocuments({ active: true }),
      Service.countDocuments({ active: false }),
      Blog.countDocuments({ published: true }),
      Blog.countDocuments({ published: false }),
      BlogCategory.countDocuments({ active: true }),
      BlogCategory.countDocuments({ active: false }),
      Testimonial.countDocuments({ approved: true }),
      Testimonial.countDocuments({ approved: false }),
      Faq.countDocuments({ status: true }),
      Faq.countDocuments({ status: false }),
      Contact.countDocuments({ replied: true }),
      Contact.countDocuments({ replied: false }),
      Appointment.countDocuments({}),
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({ status: 'approved' }),
      Appointment.countDocuments({ status: 'rejected' }),
      Appointment.countDocuments({ date: today }),
      Appointment.countDocuments({ date: today, status: 'pending' }),
      Appointment.countDocuments({ date: today, status: 'approved' }),
    ]);

    res.json({
      today,
      services: { active: servicesActive, inactive: servicesInactive, total: servicesActive + servicesInactive },
      blogs: { published: blogsPublished, unpublished: blogsUnpublished, total: blogsPublished + blogsUnpublished },
      blogCategories: {
        active: blogCategoriesActive,
        inactive: blogCategoriesInactive,
        total: blogCategoriesActive + blogCategoriesInactive,
      },
      testimonials: {
        approved: testimonialsApproved,
        pending: testimonialsPending,
        total: testimonialsApproved + testimonialsPending,
      },
      faqs: { active: faqsActive, inactive: faqsInactive, total: faqsActive + faqsInactive },
      contacts: {
        replied: contactsReplied,
        notReplied: contactsNotReplied,
        total: contactsReplied + contactsNotReplied,
      },
      appointments: {
        total: appointmentsTotal,
        pending: appointmentsPending,
        approved: appointmentsApproved,
        rejected: appointmentsRejected,
        today: {
          total: appointmentsTodayTotal,
          pending: appointmentsTodayPending,
          approved: appointmentsTodayApproved,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardCounts,
};

