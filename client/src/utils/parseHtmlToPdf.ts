import React, { ReactNode, ReactElement } from 'react';
import { Text, View, Link, Image } from '@react-pdf/renderer';
import type { Style } from '@react-pdf/types';
import { sanitizeHtml } from './sanitizeHtml';

interface PDFStyle extends Style {
    marginBottom?: number | string;
    marginTop?: number | string;
    marginLeft?: number | string;
    marginRight?: number | string;
    paddingLeft?: number | string;
    paddingRight?: number | string;
    paddingTop?: number | string;
    paddingBottom?: number | string;
    padding?: number | string;
    fontSize?: number | string;
    lineHeight?: number;
    fontWeight?: 'normal' | 'bold' | 'ultralight' | 'thin' | 'light' | 'medium' | 'semibold' | 'ultrabold' | 'heavy' | number;
    fontStyle?: 'normal' | 'italic';
    textDecoration?: 'none' | 'underline' | 'line-through' | 'underline line-through';
    textAlign?: 'left' | 'right' | 'center' | 'justify';
    color?: string;
    backgroundColor?: string;
    fontFamily?: string;
    maxWidth?: string | number;
    width?: string | number;
    height?: string | number;
    borderLeft?: string;
    borderRight?: string;
    borderTop?: string;
    borderBottom?: string;
    border?: string;
    display?: 'flex' | 'none';
    flexDirection?: 'row' | 'column';
    alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
    justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
}

interface StyleSheet {
    paragraph: PDFStyle;
    bold: PDFStyle;
    italic: PDFStyle;
    underline: PDFStyle;
    strikethrough: PDFStyle;
    heading1: PDFStyle;
    heading2: PDFStyle;
    heading3: PDFStyle;
    list: PDFStyle;
    listItem: PDFStyle;
    blockquote: PDFStyle;
    code: PDFStyle;
    codeBlock: PDFStyle;
    link: PDFStyle;
    image: PDFStyle;
    centerAlign: PDFStyle;
    rightAlign: PDFStyle;
    leftAlign: PDFStyle;
    justifyAlign: PDFStyle;
}

type ListType = 'ordered' | 'unordered';

type ParsedElement = ReactElement | string | null;
type ParsedContent = ParsedElement | ParsedElement[];

interface ListCounters {
    [key: string]: number;
}

const createStyles = (): StyleSheet => ({
    paragraph: {
        marginBottom: 8,
        fontSize: 12,
        lineHeight: 1.4,
    },
    bold: {
        fontWeight: 'bold',
    },
    italic: {
        fontStyle: 'italic',
    },
    underline: {
        textDecoration: 'underline',
    },
    strikethrough: {
        textDecoration: 'line-through',
    },
    heading1: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
        marginTop: 16,
    },
    heading2: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        marginTop: 14,
    },
    heading3: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        marginTop: 12,
    },
    list: {
        marginLeft: 20,
        marginBottom: 8,
    },
    listItem: {
        marginBottom: 4,
        fontSize: 12,
    },
    blockquote: {
        marginLeft: 20,
        paddingLeft: 10,
        borderLeft: '2 solid #ccc',
        fontStyle: 'italic',
        marginBottom: 8,
    },
    code: {
        fontFamily: 'Courier',
        backgroundColor: '#f5f5f5',
        padding: 2,
        fontSize: 10,
    },
    codeBlock: {
        fontFamily: 'Courier',
        backgroundColor: '#f5f5f5',
        padding: 8,
        marginBottom: 8,
        fontSize: 10,
    },
    link: {
        color: '#0066cc',
        textDecoration: 'underline',
    },
    image: {
        marginBottom: 8,
        maxWidth: '100%',
    },
    centerAlign: {
        textAlign: 'center',
    },
    rightAlign: {
        textAlign: 'right',
    },
    leftAlign: {
        textAlign: 'left',
    },
    justifyAlign: {
        textAlign: 'justify',
    },
});

class QuillHTMLToPDFParser {
    private styles: StyleSheet;
    private listCounters: ListCounters;

    constructor() {
        this.styles = createStyles();
        this.listCounters = {};
    }

    public parseQuillHTML(htmlString: string): ParsedContent {
        if (!htmlString) return null;

        const cleanHTML = sanitizeHtml(htmlString);
        const parser = new DOMParser();
        const doc = parser.parseFromString(cleanHTML, 'text/html');

        return this.parseNode(doc.body);
    }

    private parseNode(node: Node, parentStyle: PDFStyle = {}): ParsedContent {
        if (!node) return null;

        const elements: ParsedElement[] = [];

        for (const child of Array.from(node.childNodes)) {
            const element = this.parseElement(child, parentStyle);
            if (element) {
                if (Array.isArray(element)) {
                    elements.push(...element);
                } else {
                    elements.push(element);
                }
            }
        }

        return elements.length === 1 ? elements[0] : elements;
    }

    private parseElement(node: Node, parentStyle: PDFStyle = {}): ParsedContent {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent?.trim();
            return text || null;
        }

        if (node.nodeType !== Node.ELEMENT_NODE) return null;

        const element = node as Element;
        const tagName = element.tagName.toLowerCase();
        const computedStyle = this.computeStyle(element, parentStyle);

        switch (tagName) {
            case 'p':
                return this.createParagraph(element, computedStyle);
            case 'h1':
            case 'h2':
            case 'h3':
            case 'h4':
            case 'h5':
            case 'h6':
                return this.createHeading(element, tagName as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6', computedStyle);
            case 'strong':
            case 'b':
                return this.createStyledText(element, { ...computedStyle, fontWeight: 'bold' });
            case 'em':
            case 'i':
                return this.createStyledText(element, { ...computedStyle, fontStyle: 'italic' });
            case 'u':
                return this.createStyledText(element, { ...computedStyle, textDecoration: 'underline' });
            case 's':
            case 'strike':
                return this.createStyledText(element, { ...computedStyle, textDecoration: 'line-through' });
            case 'a':
                return this.createLink(element, computedStyle);
            case 'img':
                return this.createImage(element, computedStyle);
            case 'ul':
                return this.createList(element, 'unordered', computedStyle);
            case 'ol':
                return this.createList(element, 'ordered', computedStyle);
            case 'li':
                return this.createListItem(element, computedStyle);
            case 'br':
                return '\n';
            case 'div':
            case 'span':
                return this.createContainer(element, computedStyle);
            default:
                return this.parseNode(element, computedStyle);
        }
    }

    private computeStyle(element: Element, parentStyle: PDFStyle): PDFStyle {
        const style: PDFStyle = { ...parentStyle };

        const classList = element.classList;

        if (classList.contains('ql-align-center')) {
            style.textAlign = 'center';
        } else if (classList.contains('ql-align-right')) {
            style.textAlign = 'right';
        } else if (classList.contains('ql-align-justify')) {
            style.textAlign = 'justify';
        }

        const inlineStyle = element.getAttribute('style');
        if (inlineStyle) {
            const styleObj = this.parseInlineStyle(inlineStyle);
            Object.assign(style, styleObj);
        }

        return style;
    }

    private parseInlineStyle(styleString: string): Partial<PDFStyle> {
        const style: Partial<PDFStyle> = {};
        const declarations = styleString.split(';');

        declarations.forEach(declaration => {
            const [property, value] = declaration.split(':').map(s => s.trim());
            if (property && value) {
                switch (property) {
                    case 'color':
                        style.color = value;
                        break;
                    case 'background-color':
                        style.backgroundColor = value;
                        break;
                    case 'font-size':
                        style.fontSize = this.convertFontSize(value);
                        break;
                    case 'font-weight':
                        style.fontWeight = value as PDFStyle['fontWeight'];
                        break;
                    case 'font-style':
                        style.fontStyle = value as PDFStyle['fontStyle'];
                        break;
                    case 'text-decoration':
                        style.textDecoration = value as PDFStyle['textDecoration'];
                        break;
                    case 'text-align':
                        style.textAlign = value as PDFStyle['textAlign'];
                        break;
                }
            }
        });

        return style;
    }

    private convertFontSize(value: string): number {
        if (value.includes('px')) {
            return parseInt(value.replace('px', ''), 10);
        } else if (value.includes('pt')) {
            return parseInt(value.replace('pt', ''), 10);
        } else if (value.includes('em')) {
            return Math.round(parseFloat(value.replace('em', '')) * 12);
        }
        return 12; // default
    }

    private createParagraph(element: Element, style: PDFStyle): ReactElement {
        const children = this.parseNode(element, style);
        if (!children || (Array.isArray(children) && children.length === 0)) {
            return React.createElement(View, { style: { marginBottom: 8 } });
        }

        const paragraphStyle: PDFStyle = {
            ...this.styles.paragraph,
            ...style,
        };

        return React.createElement(Text, { style: paragraphStyle }, children as ReactNode);
    }

    private createHeading(element: Element, tagName: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6', style: PDFStyle): ReactElement {
        const children = this.parseNode(element, style);
        const headingStyleKey = tagName === 'h1' ? 'heading1' : tagName === 'h2' ? 'heading2' : 'heading3';
        const headingStyle: PDFStyle = {
            ...this.styles[headingStyleKey],
            ...style,
        };

        return React.createElement(Text, { style: headingStyle }, children as ReactNode);
    }

    private createStyledText(element: Element, style: PDFStyle): ReactElement | null {
        const children = this.parseNode(element, style);
        if (!children) return null;
        return React.createElement(Text, { style }, children as ReactNode);
    }

    private createLink(element: Element, style: PDFStyle): ReactElement | null {
        const children = this.parseNode(element, style);
        const href = element.getAttribute('href');
        if (!href || !children) return null;

        const linkStyle: PDFStyle = {
            ...this.styles.link,
            ...style,
        };

        return React.createElement(Link, { 
            src: href, 
            style: linkStyle 
            }, children as ReactNode);
    }

    private createImage(element: Element, style: PDFStyle): ReactElement | null {
        const src = element.getAttribute('src');
        if (!src) return null;

        const imageStyle: PDFStyle = {
            ...this.styles.image,
            ...style,
        };

        return React.createElement(Image, { 
            src, 
            style: imageStyle,
        });
    }

    private createList(element: Element, type: ListType, style: PDFStyle): ReactElement {
        const listId = Math.random().toString(36).substr(2, 9);

        if (type === 'ordered') {
            this.listCounters[listId] = 0;
        }

        const children: ReactElement[] = [];
        Array.from(element.childNodes).forEach((child, index) => {
            if (child.nodeType === Node.ELEMENT_NODE) {
                const childElement = child as Element;
                if (childElement.tagName.toLowerCase() === 'li') {
                    const item = this.createListItem(childElement, style, type, listId, index);
                if (item) children.push(item);
                } else {
                    this.parseNode(element, style);
                }
            }
        });

        const listStyle: PDFStyle = {
            ...this.styles.list,
            ...style,
        };

        return React.createElement(View, { style: listStyle, key: listId }, children);
    }

    private createListItem(
        element: Element, 
        style: PDFStyle, 
        listType: ListType = 'unordered', 
        listId?: string,
        index?: number
    ): ReactElement | null {
        const children = this.parseNode(element, style);
        if (!children) return null;

        const dataListValue = element.getAttribute('data-list') as ListType;
        if(dataListValue) {
            listType = dataListValue;
        }

        let bullet = '• ';

        if (listType === 'ordered' && listId && this.listCounters[listId] !== undefined) {
            this.listCounters[listId]++;
            bullet = `${this.listCounters[listId]}. `;
        }

        const itemStyle: PDFStyle = {
            ...this.styles.listItem,
            ...style,
        };

        const key = index !== undefined ? `list-item-${listId}-${index}` : Math.random().toString(36).substr(2, 9);

        return React.createElement(Text, { style: itemStyle, key }, bullet, children as ReactNode);
    }

    private createContainer(element: Element, style: PDFStyle): ReactElement | ParsedContent {
        const children = this.parseNode(element, style);

        if (element.tagName.toLowerCase() === 'div') {
            return React.createElement(View, { style }, children as ReactNode);
        } else {
            return React.createElement(Text, { style }, children as ReactNode);
        }
    }
}

export const parseQuillToReactPDF = (quillHTML: string): ParsedContent => {
    const parser = new QuillHTMLToPDFParser();
    return parser.parseQuillHTML(quillHTML);
};

export type { PDFStyle, StyleSheet, ListType, ParsedElement, ParsedContent };
