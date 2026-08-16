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

    var cards = projects.map(function (p) {
        var statusClass = (p.status || '').toLowerCase().indexOf('academic') !== -1
            ? 'status-academic'
            : 'status-in-development';

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
            '<article class="project-card">' +
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

    var html = groups.map(function (g) {
        var chips = g.items.map(function (item) {
            return '<span class="skill-chip">' + item + '</span>';
        }).join('');
        return '' +
            '<div class="skill-group">' +
                '<h3>' + g.group + '</h3>' +
                '<div class="skill-items">' + chips + '</div>' +
            '</div>';
    });

    container.innerHTML = html.join('');
}

$(document).ready(function () {
    "use strict";

    // Render data-driven sections
    if (window.PORTFOLIO) {
        renderProjects(window.PORTFOLIO.projects);
        renderSkills(window.PORTFOLIO.skills);
    }

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

    // Parallax
    var parallax = function () {
        $(window).stellar();
    };

    $(function () {
        parallax();
    });

    // AOS
    AOS.init({
        duration: 900,
        once: true,
        disable: 'mobile'
    });

    // Contact form validation
    $(function () {
        $('#contact-form').validate({
            rules: {
                name: {
                    required: true,
                    minlength: 2
                },
                email: {
                    required: true
                },
                phone: {
                    required: false
                },
                message: {
                    required: true
                }
            },
            messages: {
                name: {
                    required: "This field is required",
                    minlength: "your name must consist of at least 2 characters"
                },
                email: {
                    required: "This field is required"
                },
                message: {
                    required: "This field is required"
                }
            }
        });
    });
});
