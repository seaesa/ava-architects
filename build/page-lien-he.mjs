// Bespoke markup for /lien-he/.
//
// This is the one page that deliberately departs from the clone: the original
// leaves a tall empty red panel, an uneven form grid and a full-bleed map
// pressed against the form. The content, wording and brand language are kept;
// only the layout and spacing are reworked. Styles live in src/css/12-contact.css.

const MAP_SRC =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d286.76947835802383!2d108.2218702132947' +
  '!3d16.0441684994496!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314219c24b264c0d' +
  '%3A0xb0659a6aedbfd408!2sAVA-architects!5e1!3m2!1svi!2s!4v1737097716203!5m2!1svi!2s';

/** @param {string} rel path prefix back to the site root */
export function contactContent(rel) {
  const field = (name, label, { type = 'text', required = false, half = true } = {}) => `
          <div class="c-field${half ? '' : ' c-field--full'}">
            <label class="c-field__label" for="${name}">${label}${required ? ' <span class="c-req">*</span>' : ''}</label>
            <input class="c-field__input" type="${type}" id="${name}" name="${name}"${required ? ' required' : ''}>
          </div>`;

  return `<div id="content" class="content-area page-wrapper contact-page">

  <section class="c-hero">
    <div class="container">
      <p class="c-hero__eyebrow">Liên hệ</p>
      <h1 class="c-hero__title">Đặt lịch tư vấn</h1>
      <p class="c-hero__lead">
        Đừng bỏ lỡ ý tưởng của bạn, hãy để AVA Architects giúp bạn biến chúng thành hiện thực.
        Đội ngũ chuyên gia của AVA sẽ lắng nghe, thấu hiểu và đồng hành cùng bạn để kiến tạo nên
        dấu ấn, sự khác biệt và những giá trị bền vững.
      </p>
    </div>
  </section>

  <section class="c-main">
    <div class="container">
      <div class="c-grid">

        <aside class="c-card">
          <div class="c-card__head">
            <img class="c-card__mark" src="${rel}assets/img/2025/04/cropped-logo-ava-architects-iconic-3-192x192.png" alt="AVA Architects" width="56" height="56">
            <p class="c-card__kicker">Liên hệ trực tiếp<br>với AVA Architects</p>
          </div>

          <ul class="c-info">
            <li class="c-info__item">
              <span class="c-info__label">Văn phòng Đà Nẵng</span>
              <span class="c-info__value">29 Nguyễn Sơn Trà, P. Hòa Cường Bắc,<br>Q. Hải Châu, TP. Đà Nẵng, Việt Nam</span>
            </li>
            <li class="c-info__item">
              <span class="c-info__label">Hotline</span>
              <span class="c-info__value">
                <a href="tel:0988088411">0988 088 411</a> <em>(Mr Vũ)</em><br>
                <a href="tel:0906474758">0906 474 758</a> <em>(Mr Lâm)</em>
              </span>
            </li>
            <li class="c-info__item">
              <span class="c-info__label">Điện thoại</span>
              <span class="c-info__value"><a href="tel:02362665577">(0236) 2 66 55 77</a></span>
            </li>
            <li class="c-info__item">
              <span class="c-info__label">Email</span>
              <span class="c-info__value"><a href="mailto:kientrucava@gmail.com">kientrucava@gmail.com</a></span>
            </li>
            <li class="c-info__item">
              <span class="c-info__label">Giờ làm việc</span>
              <span class="c-info__value">Thứ 2 – Thứ 7, 08:00 – 17:30</span>
            </li>
          </ul>

          <div class="c-card__social">
            <a href="https://www.facebook.com/avaarchitects" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i class="icon-facebook"></i></a>
            <a href="https://www.youtube.com/@avaarchitects" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><i class="icon-youtube"></i></a>
            <a href="https://www.instagram.com/avaarchitects" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i class="icon-instagram"></i></a>
            <a href="https://www.linkedin.com/company/ava-architects" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i class="icon-linkedin"></i></a>
          </div>
        </aside>

        <div class="c-formwrap">
          <form class="c-form wpcf7-form" novalidate>
            <div class="c-form__grid">
${field('ho-ten', 'Họ và tên', { required: true })}
${field('dien-thoai', 'Số điện thoại', { type: 'tel', required: true })}
${field('email', 'Email', { type: 'email', required: true })}
${field('dich-vu', 'Dịch vụ yêu cầu')}
${field('loai-hinh', 'Loại hình công trình')}
${field('vi-tri', 'Vị trí xây dựng')}
${field('dien-tich', 'Diện tích đất')}

              <div class="c-field">
                <label class="c-field__label" for="tep">Đính kèm tệp <span class="c-hint">(giấy tờ pháp lý, GPXD…)</span></label>
                <label class="c-file" for="tep">
                  <span class="c-file__btn">Chọn tệp</span>
                  <span class="c-file__name" data-empty="Chưa chọn tệp nào">Chưa chọn tệp nào</span>
                  <input class="c-file__input" type="file" id="tep" name="tep">
                </label>
              </div>

              <div class="c-field c-field--full">
                <label class="c-field__label" for="ghi-chu">Ghi chú</label>
                <textarea class="c-field__input c-field__input--area" id="ghi-chu" name="ghi-chu" rows="5"
                  placeholder="Thời gian bạn có thể nhận tư vấn, mô tả về mong muốn của bạn…"></textarea>
              </div>
            </div>

            <div class="c-form__foot">
              <p class="c-form__note"><span class="c-req">*</span> Thông tin bắt buộc</p>
              <button type="submit" class="c-submit">
                <span>Gửi liên hệ</span><i class="icon-angle-right" aria-hidden="true"></i>
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  </section>

  <section class="c-map">
    <div class="container">
      <div class="c-map__frame">
        <iframe src="${MAP_SRC}" title="Bản đồ tới văn phòng AVA Architects tại Đà Nẵng"
          loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
      </div>
    </div>
  </section>

</div>`;
}
