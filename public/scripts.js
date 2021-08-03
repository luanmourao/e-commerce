const Mask = {

  apply(input, method) {
    setTimeout(function() {
      input.value = Mask[method](input.value);
    }, .1)
  },

  formatBRL(value) {
    value = value.replace(/\D/g, "");

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value/100);
  },

  cpfCnpj(value) {
    value = value.replace(/\D/g, "");

    if (value.length > 14) {
      value = value.slice(0, -1);
    }

    if (value.length > 11) {
      value = value.replace(/(\d{2})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d)/, "$1/$2");
      value = value.replace(/(\d{4})(\d)/, "$1-$2");

    } else {
      value = value.replace(/(\d{3})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d)/, "$1-$2");

    }

    return value;
  },

  cep(value) {
    value = value.replace(/\D/g, "");

    if (value.length > 8) {
      value = value.slice(0, -1);
    }

    value = value.replace(/(\d{5})(\d)/, "$1-$2");

    return value;
  }

};

const PhotosUpload = {
  uploadLimit: 6,
  preview: document.querySelector("#photos-preview"),
  files: [],
  input: "",

  handleFileInput(event) {
    const { files: fileList } = event.target;
    this.input = event.target;

    if (this.hasLimit(event)) return;

    Array.from(fileList).forEach(file => {
      this.files.push(file);

      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        const preview = this.preview;

        const image = new Image();
        image.src = String(reader.result);

        const div = this.getContainer(image);

        preview.appendChild(div);
      }
    });

    this.input.files = this.getAllFiles();
  },

  hasLimit(event) {
    const { uploadLimit, input, preview } = PhotosUpload;
    const { files: fileList } = input;
    const photosDiv = [];

    if (fileList.length > uploadLimit) {
      alert(`Envie no máximo ${uploadLimit} fotos`);
      event.preventDefault();

      return true;
    }

    preview.childNodes.forEach(item => {
      if (item.classList && item.classList.value == "photo") {
        photosDiv.push(item);
      }
    });

    const totalPhotos = fileList.length + photosDiv.length;

    if (totalPhotos > uploadLimit) {
      alert("Você atingiu o limite máximo de fotos");

      event.preventDefault();
      
      return true;
    }

    return false;
  },

  getAllFiles() {
    const dataTransfer = new ClipboardEvent("").clipboardData || new DataTransfer();
    const files = this.files;

    files.forEach(file => dataTransfer.items.add(file));

    return dataTransfer.files;
  },

  getContainer(image) {
    const div = document.createElement("div");
    div.classList.add("photo");

    div.onclick = this.removePhoto;

    div.appendChild(image);

    div.appendChild(this.getRemoveButton());

    return div;
  },

  getRemoveButton() {
    const button = document.createElement("i");
    button.classList.add("material-icons");
    button.innerHTML = "close";

    return button;
  },

  removePhoto(event) {
    const photoDiv = event.target.parentNode; // <div class="photo">
    const photosArray = Array.from(this.preview.children);
    const index = photosArray.indexOf(photoDiv);

    PhotosUpload.files.splice(index, 1);
    PhotosUpload.input.files = this.getAllFiles();

    photoDiv.remove();
  },

  removeOldPhoto(event) {
    const photoDiv = event.target.parentNode;

    if (photoDiv.id) {
      const removedFiles = document.querySelector('input[name="removed_files"]');

      if (removedFiles) {
        removedFiles.value += `${photoDiv.id},`;
      }
    }

    photoDiv.remove();
  }

};

const ImageGallery = {
  highlight: document.querySelector('.gallery .highlight > img'),
  previews: document.querySelectorAll('.gallery-preview img'),

  setImage(event) {
    const { target } = event;
    const previews = this.previews;
    const highlight = this.highlight;

    previews.forEach(preview => preview.classList.remove('active'));
    target.classList.add('active');

    highlight.src = target.src;
    Lightbox.image.src = target.src;
  }
};

const Lightbox = {
  target: document.querySelector('.lightbox-target'),
  image: document.querySelector('.lightbox-target img'),
  closeButton: document.querySelector('.lightbox-target a.lightbox-close'),
  
  open() {
    const target = this.target;
    const closeButton = this.closeButton;

    target.style.opacity = 1;
    target.style.top = 0;
    target.style.bottom = 0;
    closeButton.style.top = 0;
  },

  close() {
    const target = this.target;
    const closeButton = this.closeButton;

    target.style.opacity = 0;
    target.style.top = "-100%";
    target.style.bottom = "initial";
    closeButton.style.top = "-80px";
  }
};

const Validate = {

  apply(input, method) {
    this.clearErrors(input);

    let results = Validate[method](input.value);
    input.value = results.value;

    if (results.error) {
      this.displayError(input, results.error);
    }

  },
  
  displayError(input, error) {
    const div = document.createElement('div');
    div.classList.add('error');
    div.innerHTML = error;
    input.parentNode.appendChild(div);
    input.focus();
  },

  clearErrors(input) {
    const errorDiv = input.parentNode.querySelector('.error');

    if (errorDiv) {
      errorDiv.remove();
    }
  },

  isEmail(value) {
    let error = null;
    const mailFormat = /\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; 

    if (!value.match(mailFormat)) {
      error = "Email incorreto";
    }

    return {
      error,
      value
    }
  },

  isCpfCnpj(value) {
    let error = null;
    const cleanValues = value.replace(/\D/g, "");

    if (cleanValues.length > 11 && cleanValues.length !== 14) {
      error = "CNPJ inválido";
    } else if (cleanValues.length < 12 && cleanValues.length !==11) {
        error = "CPF inválido";
    }

    return {
      error,
      value
    }
  },

  isCep(value) {
    let error = null;
    const cleanValues = value.replace(/\D/g, "");

    if (cleanValues.length !== 8) {
      error = "CEP inválido";
    }

    return {
      error,
      value
    }
  },

  allFields(event) {
    const items = document.querySelectorAll('.item input, .item select, .item textarea');

    for (item of items) {
      if (item.value === "") {
        const messageElement = document.createElement('div');
        messageElement.classList.add('messages');
        messageElement.classList.add('error');
        messageElement.innerHTML = "Por favor, preencha todos os campos";
        document.querySelector('body').append(messageElement);

        event.preventDefault();

        return;
      }
    }
  }

};

const ControlEvents = {

  confirmSubmit(element, message) {

    element.addEventListener("submit", (event) => {
      const confirmation = confirm(`Tem certeza que deseja marcar este pedido como ${message}? Essa ação não poderá ser desfeita.`);

      if (!confirmation) {
        event.preventDefault();
      }
    })
  }
}

