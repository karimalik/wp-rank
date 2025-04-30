jQuery(document).ready(function($) {
    let currentFilters = {
        category: 'all',
        gender: 'all',
        weight: 'all',
        club: 'all',
        view: 'simple'
    };

    initWeightCategories();
    $('.ranking-table').attr('data-view', 'simple');

    $('#category-filter').on('change', function() {
        currentFilters.category = $(this).val();
        updateRankingTable();
    });

    $('.gender-btn').on('click', function() {
        $('.gender-btn').removeClass('active');
        $(this).addClass('active');
        
        currentFilters.gender = $(this).data('gender');
        
        if (currentFilters.gender !== 'all') {
            $('.weight-group').hide();
            $('.weight-group[data-gender="' + currentFilters.gender + '"]').show();
        } else {
            $('.weight-group').show();
            $('.weight-btn').removeClass('active');
            currentFilters.weight = 'all';
        }
        
        updateRankingTable();
    });
    
    $('.weight-btn').on('click', function() {
        $('.weight-btn').removeClass('active');
        $(this).addClass('active');
        
        currentFilters.weight = $(this).data('weight');
        
        updateRankingTable();
    });
    
    $('#club-filter').on('change', function() {
        currentFilters.club = $(this).val();
        updateRankingTable();
    });

    $('.view-btn').on('click', function() {
        $('.view-btn').removeClass('active');
        $(this).addClass('active');
        
        currentFilters.view = $(this).data('view');
        $('.ranking-table').attr('data-view', currentFilters.view);
    });
    
    let searchTimeout;
    $('#search-name').on('input', function() {
        const searchTerm = $(this).val().toLowerCase();
        
        clearTimeout(searchTimeout);
        
        searchTimeout = setTimeout(function() {
            filterTableByName(searchTerm);
        }, 300);
    });
    
    function initWeightCategories() {

        const activeGender = $('.gender-btn.active').data('gender');
        if (activeGender && activeGender !== 'all') {
            $('.weight-group').hide();
            $('.weight-group[data-gender="' + activeGender + '"]').show();
        }
    }
    
    function filterTableByName(searchTerm) {
        if (!searchTerm) {
            $('.ranking-row').show();
            return;
        }
        
        $('.ranking-row').each(function() {
            const judokaName = $(this).find('.judoka-name').text().toLowerCase();
            if (judokaName.includes(searchTerm)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    }
    
    function updateRankingTable() {
        $.ajax({
            url: judokaRankingAjax.ajaxurl,
            type: 'POST',
            data: {
                action: 'filter_judokas',
                nonce: judokaRankingAjax.nonce,
                ...currentFilters
            },
            beforeSend: function() {
                $('.ranking-body').addClass('loading');
            },
            success: function(response) {
                if (response.success) {
                    $('.ranking-body').html(response.data.html);
                    
                    const searchTerm = $('#search-name').val().toLowerCase();
                    if (searchTerm) {
                        filterTableByName(searchTerm);
                    }
                    
                    animateRows();
                }
            },
            complete: function() {
                $('.ranking-body').removeClass('loading');
            }
        });
    }
    
    function animateRows() {
        $('.ranking-row').each(function(index) {
            const $row = $(this);
            $row.css('opacity', 0);
            
            setTimeout(function() {
                $row.animate({
                    opacity: 1
                }, 200);
            }, index * 50);
        });
    }
    
    animateRows();
    
    function handleResponsiveLayout() {
        if (window.innerWidth <= 992) {
            if (!$('.mobile-filter-toggle').length) {
                $('.ranking-sidebar').before('<button class="mobile-filter-toggle">Filtres</button>');
            }
        } else {
            $('.mobile-filter-toggle').remove();
            $('.ranking-sidebar').show();
        }
    }
    
    $(document).on('click', '.mobile-filter-toggle', function() {
        $('.ranking-sidebar').slideToggle(200);
    });
    
    handleResponsiveLayout();
    $(window).on('resize', handleResponsiveLayout);
    
    const mobileToggleStyle = `
        .mobile-filter-toggle {
            display: none;
            width: 100%;
            padding: 12px;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 500;
            cursor: pointer;
            margin-bottom: 15px;
            text-align: center;
        }
        
        @media (max-width: 992px) {
            .mobile-filter-toggle {
                display: block;
            }
            
            .ranking-sidebar {
                display: none;
            }
        }
    `;
    
    $('head').append(`<style>${mobileToggleStyle}</style>`);
});