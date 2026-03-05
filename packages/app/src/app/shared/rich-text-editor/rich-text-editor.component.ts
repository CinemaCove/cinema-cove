import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
  input,
  output,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'cc-rich-text-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './rich-text-editor.component.html',
  styleUrl: './rich-text-editor.component.scss',
})
export class RichTextEditorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('editorEl') editorElRef!: ElementRef<HTMLDivElement>;
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  readonly initialContent = input<string>('');
  readonly placeholder = input<string>('Write something...');
  readonly contentChange = output<string>();

  private readonly http = inject(HttpClient);
  private editor?: Editor;

  ngAfterViewInit(): void {
    this.editor = new Editor({
      element: this.editorElRef.nativeElement,
      extensions: [
        StarterKit,
        Image.configure({ allowBase64: false }),
        Youtube.configure({ width: 640, height: 360, nocookie: true }),
        Link.configure({ openOnClick: false, autolink: true }),
        Placeholder.configure({ placeholder: this.placeholder() }),
      ],
      content: this.initialContent(),
      onUpdate: ({ editor }) => {
        this.contentChange.emit(editor.getHTML());
      },
    });
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
  }

  isActive(name: string, attrs?: Record<string, unknown>): boolean {
    return this.editor?.isActive(name, attrs) ?? false;
  }

  bold() { this.editor?.chain().focus().toggleBold().run(); }
  italic() { this.editor?.chain().focus().toggleItalic().run(); }
  strike() { this.editor?.chain().focus().toggleStrike().run(); }
  heading(level: 1 | 2 | 3) { this.editor?.chain().focus().toggleHeading({ level }).run(); }
  bulletList() { this.editor?.chain().focus().toggleBulletList().run(); }
  orderedList() { this.editor?.chain().focus().toggleOrderedList().run(); }
  blockquote() { this.editor?.chain().focus().toggleBlockquote().run(); }
  codeBlock() { this.editor?.chain().focus().toggleCodeBlock().run(); }
  horizontalRule() { this.editor?.chain().focus().setHorizontalRule().run(); }
  undo() { this.editor?.chain().focus().undo().run(); }
  redo() { this.editor?.chain().focus().redo().run(); }

  setLink() {
    const url = prompt('Enter URL:');
    if (url === null) return;
    if (url === '') {
      this.editor?.chain().focus().unsetLink().run();
    } else {
      this.editor?.chain().focus().setLink({ href: url }).run();
    }
  }

  triggerImageUpload() {
    this.fileInputRef.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    input.value = '';

    const formData = new FormData();
    formData.append('file', file);
    this.http
      .post<{ url: string }>(`${environment.apiUrl}/uploads/image`, formData)
      .subscribe((res) => {
        this.editor?.chain().focus().setImage({ src: res.url }).run();
      });
  }

  insertYoutube() {
    const url = prompt('Enter YouTube URL:');
    if (!url) return;
    this.editor?.chain().focus().setYoutubeVideo({ src: url }).run();
  }

  getHTML(): string {
    return this.editor?.getHTML() ?? '';
  }

  setContent(html: string) {
    this.editor?.commands.setContent(html);
  }
}
