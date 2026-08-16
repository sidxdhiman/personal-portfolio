// JavaScript Document

$(window).load(function () {
    "use strict";
    // makes sure the whole site is loaded
    $('#status').fadeOut(); // will first fade out the loading animation
    $('#preloader').delay(350).fadeOut('slow'); // will fade out the white DIV that covers the website.
    $('body').delay(350).css({
        'overflow': 'visible'
    });
})

// ------------------------------------------------------------
// Render projects & skills from the centralized data (js/data.js)
// ------------------------------------------------------------
function renderProjects(projects) {
    var grid = document.getElementById('projects-grid');
    if (!grid || !projects) return;

    var cards = projects.map(function (p, i) {
        var statusClass = (p.status || '').toLowerCase().indexOf('academic') !== -1
            ? 'status-academic'
            : 'status-in-development';

        var delay = i * 120;
        var highlight = p.highlight
            ? '<p class="project-highlight">' + p.highlight + '</p>'
            : '';

        var tags = (p.tags || []).map(function (t) {
            return '<span>' + t + '</span>';
        }).join('');

        var github = p.githubUrl
            ? '<a class="project-link" href="' + p.githubUrl + '" target="_blank" rel="noopener">View GitHub <span aria-hidden="true">&rarr;</span></a>'
            : '';

        var demo = p.demoUrl
            ? '<a class="project-link" href="' + p.demoUrl + '" target="_blank" rel="noopener">Live Demo <span aria-hidden="true">&rarr;</span></a>'
            : '';

        return '' +
            '<article class="project-card" data-reveal="fade-up" style="--reveal-delay: ' + delay + 'ms">' +
                '<div class="project-head">' +
                    '<h3 class="project-name">' + p.name + '</h3>' +
                    '<span class="status-badge ' + statusClass + '">' + p.status + '</span>' +
                '</div>' +
                '<p class="project-desc">' + p.description + '</p>' +
                highlight +
                '<div class="project-tags">' + tags + '</div>' +
                '<div class="project-links">' + github + demo + '</div>' +
            '</article>';
    });

    grid.innerHTML = cards.join('');
}

function renderSkills(groups) {
    var container = document.getElementById('skills-grid');
    if (!container || !groups) return;

    var html = groups.map(function (g, i) {
        var delay = i * 90;
        var chips = g.items.map(function (item) {
            var slug = window.PORTFOLIO.skillLogos ? window.PORTFOLIO.skillLogos[item] : null;
            var logo = slug
                ? '<img class="skill-logo" src="img/skills/' + slug + '.svg" alt="" aria-hidden="true" />'
                : '';
            return '<span class="skill-chip">' + logo + '<span class="skill-chip-name">' + item + '</span></span>';
        }).join('');
        return '' +
            '<div class="skill-group" data-reveal="fade-up" style="--reveal-delay: ' + delay + 'ms">' +
                '<h3>' + g.group + '</h3>' +
                '<div class="skill-items">' + chips + '</div>' +
            '</div>';
    });

    container.innerHTML = html.join('');
}

// ------------------------------------------------------------
// Reveal-on-scroll animations
// ------------------------------------------------------------
function initReveal() {
    var els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;

    if (!('IntersectionObserver' in window)) {
        els.forEach(function (el) { el.classList.add('is-revealed'); });
        return;
    }

    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-revealed');
                io.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -48px 0px'
    });

    els.forEach(function (el) { io.observe(el); });
}

$(document).ready(function () {
    "use strict";

    // Render data-driven sections
    if (window.PORTFOLIO) {
        renderProjects(window.PORTFOLIO.projects);
        renderSkills(window.PORTFOLIO.skills);
    }

    // Scroll-reveal animations
    initReveal();

    // Back to top
    var toTop = $('#toTop');
    function toggleToTop() {
      if ($(window).scrollTop() > $(window).height() * .8) {
        toTop.addClass('show');
      } else {
        toTop.removeClass('show');
      }
    }
    toggleToTop();
    $(window).on('scroll', toggleToTop);
    toTop.on('click', function () {
      $('html, body').animate({ scrollTop: 0 }, 600);
      return false;
    });

    // scroll menu
    var sections = $('.section'),
        nav = $('.navbar-fixed-top,footer'),
        nav_height = nav.outerHeight();

    $(window).on('scroll', function () {
        var cur_pos = $(this).scrollTop();

        sections.each(function () {
            var top = $(this).offset().top - nav_height,
                bottom = top + $(this).outerHeight();

            if (cur_pos >= top && cur_pos <= bottom) {
                nav.find('a').removeClass('active');
                sections.removeClass('active');

                $(this).addClass('active');
                nav.find('a[href="#' + $(this).attr('id') + '"]').addClass('active');
            }
        });
    });

    nav.find('a').on('click', function () {
        var $el = $(this),
            id = $el.attr('href');

        $('html, body').animate({
            scrollTop: $(id).offset().top - nav_height + 2
        }, 600);

        return false;
    });

    // Menu opacity
    if ($(window).scrollTop() > 80) {
        $(".navbar-fixed-top").addClass("bg-nav");
    } else {
        $(".navbar-fixed-top").removeClass("bg-nav");
    }
    $(window).scroll(function () {
        if ($(window).scrollTop() > 80) {
            $(".navbar-fixed-top").addClass("bg-nav");
        } else {
            $(".navbar-fixed-top").removeClass("bg-nav");
        }
    });

    // Contact form -> Netlify function -> Telegram
    var contactForm = $('#contact-form');
    var contactSubmit = $('#submit', contactForm);

    function setContactState(state) {
        if (state === 'sending') {
            contactSubmit.prop('disabled', true).text('Sending...');
            $('#error', contactForm).hide();
            $('#success', contactForm).hide();
        } else {
            contactSubmit.prop('disabled', false).text('Let\u2019s talk \u2192');
        }
    }

    function submitContact(form) {
        // Honeypot anti-spam: bots fill the hidden field; silently accept and stop.
        var hp = $(form).find('[name="website"]').val();
        if (hp && hp.trim().length > 0) {
            setContactState('idle');
            $(form)[0].reset();
            $('#success', contactForm).fadeIn();
            return;
        }

        setContactState('sending');

        $.ajax({
            url: '/api/contact',
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({
                name: $(form).find('[name="name"]').val().trim(),
                email: $(form).find('[name="email"]').val().trim(),
                message: $(form).find('[name="message"]').val().trim()
            })
        }).done(function () {
            setContactState('idle');
            $(form)[0].reset();
            $('#success', contactForm).fadeIn();
        }).fail(function () {
            setContactState('idle');
            $('#error', contactForm).fadeIn();
        });
    }

    contactForm.validate({
        rules: {
            name: {
                required: true,
                minlength: 2,
                maxlength: 100
            },
            email: {
                required: true,
                email: true,
                maxlength: 150
            },
            message: {
                required: true,
                maxlength: 2000
            }
        },
        messages: {
            name: {
                required: "Please enter your name.",
                minlength: "Your name must be at least 2 characters.",
                maxlength: "Your name must be 100 characters or fewer."
            },
            email: {
                required: "Please enter your email.",
                email: "Please enter a valid email address.",
                maxlength: "Email must be 150 characters or fewer."
            },
            message: {
                required: "Please enter a message.",
                maxlength: "Your message must be 2000 characters or fewer."
            }
        },
        submitHandler: function (form) {
            submitContact(form);
        }
    });
});